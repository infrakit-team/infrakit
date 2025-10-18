import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	boolean,
	command,
	positional,
	type TypeOf,
} from "@drizzle-team/brocli";
import { $ } from "bun";

const uiOptions = {
	version: positional("version").desc(
		"Version to release (e.g. 0.1.3 or ui-v0.1.3)",
	),
	dryRun: boolean("dry-run")
		.alias("d")
		.desc("Preview the release without publishing")
		.default(false),
};

type UiOptions = TypeOf<typeof uiOptions>;

const normalizeTag = (input: string) => {
	if (input.startsWith("ui-v")) return input;
	if (input.startsWith("v")) return `ui-${input}`;
	return `ui-v${input}`;
};

const ensureCommands = () => {
	const required = ["git", "bunx", "gh"];
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

const validateVersion = (tag: string) => {
	if (!/^ui-v[0-9]+\.[0-9]+\.[0-9]+$/.test(tag)) {
		throw new Error(
			"Version must match ui-v<major>.<minor>.<patch> (examples: 0.1.3, v0.1.3, ui-v0.1.3).",
		);
	}
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

const findPreviousTag = async (currentTag: string) => {
	const tagList = await $`git tag --list ui-v* --sort=-version:refname`.text();
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

const createRelease = async (tag: string, notes: string, dryRun: boolean) => {
	const targetCommit = (await $`git rev-parse HEAD`.text()).trim();
	console.log(`Creating ${tag} from ${targetCommit}`);

	if (dryRun) {
		console.log(
			`[dry-run] gh release create "${tag}" --title "${tag}" --notes-file <tempfile> --target "${targetCommit}"`,
		);
		return;
	}

	const tmpDir = mkdtempSync(join(tmpdir(), "ui-release-"));
	const notesPath = join(tmpDir, "notes.md");
	writeFileSync(notesPath, notes, "utf8");

	try {
		await $`gh release create ${tag} --title ${tag} --notes-file ${notesPath} --target ${targetCommit}`;
		console.log(`Release ${tag} created.`);
	} finally {
		rmSync(tmpDir, { recursive: true, force: true });
	}
};

export const uiCommand = command({
	name: "ui",
	desc: "Create a GitHub release for the UI package",
	options: uiOptions,
	handler: async (options: UiOptions) => {
		ensureCommands();
		await ensureRepoRoot();

		const tag = normalizeTag(options.version);
		validateVersion(tag);
		await ensureTagDoesNotExist(tag);

		await ensureCleanWorkingTree();

		const previousTag = await findPreviousTag(tag);
		const notes = await generateNotes(previousTag, tag);

		await createRelease(tag, notes, options.dryRun ?? false);
	},
});
