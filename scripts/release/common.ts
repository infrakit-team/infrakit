import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	boolean,
	command,
	positional,
	type TypeOf,
} from "@drizzle-team/brocli";
import { $ } from "bun";

const decoder = new TextDecoder();
const shouldShowStack = (() => {
	const flag = (
		process.env.RELEASE_DEBUG ??
		process.env.DEBUG_RELEASE ??
		""
	).toLowerCase();
	return flag === "1" || flag === "true" || flag === "yes";
})();

export class StepError extends Error {
	constructor(
		public readonly step: string,
		public readonly cause: unknown,
	) {
		super(formatStepError(step, cause));
		this.name = "StepError";
		this.step = step;
		this.cause = cause;
	}
}

export const runStep = async <T>(
	label: string,
	fn: () => Promise<T> | T,
): Promise<T> => {
	console.log(`→ ${label}`);
	try {
		return await fn();
	} catch (cause) {
		throw new StepError(label, cause);
	}
};

type ShellErrorLike = Error & {
	exitCode?: number;
	stdout?: unknown;
	stderr?: unknown;
	cmd?: string[];
};

const formatStepError = (step: string, cause: unknown): string => {
	const prefix = `Failed during ${step}.`;
	if (cause instanceof Error) {
		const segments: string[] = [];
		const shellDetails = formatShellError(cause);

		if (shellDetails) {
			segments.push(shellDetails);
		} else {
			const message = cause.message?.trim();
			if (message) {
				segments.push(message);
			}
		}

		if (shouldShowStack && cause.stack) {
			segments.push(`Stack trace:\n${cause.stack}`);
		}

		return segments.length ? `${prefix}\n${segments.join("\n")}` : prefix;
	}

	if (cause === undefined || cause === null) {
		return prefix;
	}

	return `${prefix}\n${String(cause)}`;
};

const formatShellError = (error: ShellErrorLike): string | null => {
	if (typeof error.exitCode !== "number") {
		return null;
	}

	const lines: string[] = [];
	const message = error.message?.trim();
	if (message) {
		lines.push(message);
	}

	const cmd = Array.isArray(error.cmd) ? error.cmd.join(" ") : undefined;
	if (cmd) {
		lines.push(`Command: ${cmd}`);
	}

	lines.push(`Exit code: ${error.exitCode}`);

	const stdout = formatShellOutput(error.stdout);
	if (stdout) {
		lines.push(`stdout:\n${stdout}`);
	}

	const stderr = formatShellOutput(error.stderr);
	if (stderr) {
		lines.push(`stderr:\n${stderr}`);
	}

	return lines.join("\n");
};

const formatShellOutput = (output: unknown): string => {
	if (!output) {
		return "";
	}

	if (typeof output === "string") {
		return output.trim();
	}

	if (output instanceof Uint8Array) {
		return decoder.decode(output).trim();
	}

	if (Array.isArray(output)) {
		return output.map(formatShellOutput).filter(Boolean).join("\n");
	}

	if (typeof output === "object" && output !== null && "toString" in output) {
		return String(output).trim();
	}

	return String(output);
};

export interface ReleaseCommandConfig {
	name: string;
	desc: string;
	tagPrefix: string;
	displayName: string;
	packageJsonPaths?: string[];
}

const ensureCommands = () => {
	const required = ["git", "bunx", "gh", "npm"];
	const missing = required.filter((cmd) => !Bun.which(cmd));

	if (missing.length) {
		throw new Error(`Missing required commands: ${missing.join(", ")}`);
	}
};

const ensureRepoRoot = async () => {
	const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim();
	if (!repoRoot) {
		throw new Error("Run this command from within the infrakit repository.");
	}
	$.cwd(repoRoot);
	return repoRoot;
};

const normalizeTag = (prefix: string, input: string) => {
	const expected = `${prefix}-v`;
	if (input.startsWith(expected)) return input;
	if (input.startsWith("v")) return `${prefix}-${input}`;
	return `${expected}${input}`;
};

const validateVersion = (prefix: string, tag: string) => {
	const pattern = new RegExp(`^${prefix}-v[0-9]+\\.[0-9]+\\.[0-9]+$`);
	if (!pattern.test(tag)) {
		throw new Error(
			`Version must match ${prefix}-v<major>.<minor>.<patch> (examples: 0.1.3, v0.1.3, ${prefix}-v0.1.3).`,
		);
	}
};

const extractVersion = (prefix: string, tag: string) => {
	const expected = `${prefix}-v`;
	if (!tag.startsWith(expected)) {
		throw new Error(
			`Normalized tag ${tag} does not start with expected prefix ${expected}.`,
		);
	}
	return tag.slice(expected.length);
};

const ensureTagDoesNotExist = async (tag: string) => {
	const localTag = await $`git rev-parse --verify ${tag}`.quiet().nothrow();
	if (localTag.exitCode === 0) {
		throw new Error(
			`Tag ${tag} already exists locally. Delete it first if you need to recreate the release.`,
		);
	}

	const remoteRelease = await $`gh release view ${tag}`.quiet().nothrow();
	if (remoteRelease.exitCode === 0) {
		throw new Error(`Release ${tag} already exists on GitHub.`);
	}
};

const findPreviousTag = async (prefix: string, currentTag: string) => {
	const tagList =
		(await $`git tag --list "${prefix}-v*" --sort=-version:refname`.text()) as string;
	return tagList
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.find((tag) => tag !== currentTag);
};

const generateNotes = async (
	previousTag: string | undefined,
	currentTag: string,
) => {
	const range = previousTag ? `${previousTag}..HEAD` : undefined;
	const notes = range
		? (await $`bunx git-cliff ${range} --tag ${currentTag}`.text()).trimEnd()
		: (await $`bunx git-cliff --tag ${currentTag}`.text()).trimEnd();

	if (!notes.trim()) {
		throw new Error("git-cliff did not generate any notes; aborting.");
	}
	return notes.endsWith("\n") ? notes : `${notes}\n`;
};

const ensureCleanWorkingTree = async () => {
	const status = (await $`git status --porcelain`.text()).trim();
	if (status.length > 0) {
		throw new Error(
			"Working tree has uncommitted changes. Commit or stash before releasing.",
		);
	}
};

const ensureHeadPushed = async () => {
	const upstream = await $`git rev-parse --abbrev-ref --symbolic-full-name @{u}`
		.quiet()
		.nothrow();

	if (upstream.exitCode !== 0) {
		throw new Error(
			"No upstream branch configured for HEAD. Push the current branch before releasing.",
		);
	}

	const aheadBehind = (
		await $`git rev-list --left-right --count @{u}...HEAD`.text()
	).trim();
	const [behindCount, aheadCount] = aheadBehind.split(/\s+/).map(Number);

	if (Number.isNaN(behindCount) || Number.isNaN(aheadCount)) {
		throw new Error("Could not determine upstream sync status.");
	}

	if (aheadCount > 0) {
		throw new Error(
			"Local branch has commits not yet pushed to upstream. Push before releasing.",
		);
	}
};

const updatePackageVersions = (
	repoRoot: string,
	paths: string[],
	version: string,
	dryRun: boolean,
) => {
	for (const relativePath of paths) {
		const packagePath = join(repoRoot, relativePath);
		if (!existsSync(packagePath)) {
			console.log(`  - Skipping missing package.json: ${relativePath}`);
			continue;
		}
		if (dryRun) {
			console.log(`  - [dry-run] Set ${relativePath} version to ${version}`);
			continue;
		}
		const contents = readFileSync(packagePath, "utf8");
		const pkg = JSON.parse(contents) as Record<string, unknown>;
		pkg.version = version;
		const serialized = JSON.stringify(pkg, null, "\t");
		writeFileSync(packagePath, `${serialized}\n`, "utf8");
		console.log(`  - Set ${relativePath} version to ${version}`);
	}
};

const updateBunLockfile = async (dryRun: boolean) => {
	if (dryRun) {
		console.log("[dry-run] bun update");
		return;
	}

	await $`bun update`;
	console.log("Updated bun.lockb");
};

const commitAndPushVersionBump = async (
	tag: string,
	packagePaths: string[],
	dryRun: boolean,
) => {
	if (packagePaths.length === 0) {
		console.log("No package.json files to commit.");
		return;
	}

	const commitMessage = `chore: bump version to ${tag}`;

	if (dryRun) {
		console.log(`[dry-run] git add ${packagePaths.join(" ")}`);
		console.log("[dry-run] git add bun.lockb");
		console.log(`[dry-run] git commit -m "${commitMessage}"`);
		console.log("[dry-run] git push");
		return;
	}

	// Stage the updated package.json files
	for (const path of packagePaths) {
		await $`git add ${path}`;
	}

	// Stage the bun lockfile
	await $`git add bun.lock`;

	// Create the commit
	await $`git commit -m ${commitMessage}`;
	console.log(`Committed version bump: ${commitMessage}`);

	// Push to remote
	await $`git push`;
	console.log("Pushed version bump commit to remote.");
};

const createRelease = async (tag: string, notes: string, dryRun: boolean) => {
	const targetCommit = (await $`git rev-parse HEAD`.text()).trim();
	console.log(`Creating ${tag} from ${targetCommit}`);

	if (dryRun) {
		console.log(
			`[dry-run] gh release create "${tag}" --title "${tag}" --notes-file <tempfile> --target "${targetCommit}"`,
		);
		return;
	}

	const tmpDir = mkdtempSync(join(tmpdir(), "release-"));
	const notesPath = join(tmpDir, "notes.md");
	writeFileSync(notesPath, notes, "utf8");

	try {
		await $`gh release create ${tag} --title ${tag} --notes-file ${notesPath} --target ${targetCommit}`;
		console.log(`Release ${tag} created.`);
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
};

export const createReleaseCommand = (config: ReleaseCommandConfig) => {
	const releaseOptions = {
		version: positional("version").desc(
			`Version to release (e.g. 0.1.3 or ${config.tagPrefix}-v0.1.3)`,
		),
		dryRun: boolean("dry-run")
			.alias("d")
			.desc("Preview the release without publishing")
			.default(false),
	};

	type ReleaseOptions = TypeOf<typeof releaseOptions>;
	const packageJsonPaths = config.packageJsonPaths ?? [];

	return command({
		name: config.name,
		desc: config.desc,
		options: releaseOptions,
		handler: async (options: ReleaseOptions) => {
			const isDryRun = options.dryRun ?? false;
			await runStep("verifying required commands", () => ensureCommands());
			const repoRoot = await runStep(
				"locating repository root",
				ensureRepoRoot,
			);
			console.log(`Repository root: ${repoRoot}`);

			const tag = await runStep("validating version input", () => {
				const normalized = normalizeTag(config.tagPrefix, options.version);
				validateVersion(config.tagPrefix, normalized);
				return normalized;
			});
			console.log(`Normalized tag: ${tag}`);
			const semver = extractVersion(config.tagPrefix, tag);

			await runStep("checking for existing tag or release", () =>
				ensureTagDoesNotExist(tag),
			);
			await runStep("checking for uncommitted changes", ensureCleanWorkingTree);
			await runStep(
				"verifying upstream branch is synchronized",
				ensureHeadPushed,
			);

			if (packageJsonPaths.length > 0) {
				await runStep(
					isDryRun
						? "previewing package.json version updates"
						: "updating package.json versions",
					() =>
						updatePackageVersions(repoRoot, packageJsonPaths, semver, isDryRun),
				);

				await runStep(
					isDryRun ? "previewing bun lockfile update" : "updating bun lockfile",
					() => updateBunLockfile(isDryRun),
				);

				await runStep(
					isDryRun
						? "previewing version bump commit and push"
						: "committing and pushing version bump",
					() => commitAndPushVersionBump(tag, packageJsonPaths, isDryRun),
				);
			}

			const previousTag = await runStep(
				`locating previous ${config.displayName} tag`,
				() => findPreviousTag(config.tagPrefix, tag),
			);
			if (previousTag) {
				console.log(`Previous tag detected: ${previousTag}`);
			} else {
				console.log(
					`No previous ${config.displayName} tag detected; using full history.`,
				);
			}

			const notes = await runStep(
				"generating release notes with git-cliff",
				() => generateNotes(previousTag, tag),
			);

			await runStep(
				options.dryRun
					? "preparing release preview"
					: "creating GitHub release",
				() => createRelease(tag, notes, options.dryRun ?? false),
			);
		},
	});
};
