import { readFileSync } from "node:fs";
import { command } from "@drizzle-team/brocli";
import type { ReleaseCommandConfig } from "./common";
import { uiReleaseConfig } from "./ui";
import { sdkReleaseConfig } from "./sdk";
import { kvReleaseConfig } from "./modules/kv";

type ReleaseGroup = {
	config: ReleaseCommandConfig;
};

const releaseGroups: ReleaseGroup[] = [
	{ config: uiReleaseConfig },
	{ config: sdkReleaseConfig },
	{ config: kvReleaseConfig },
];

type PackageVersion = {
	path: string;
	version?: string;
};

const readPackageVersion = (path: string): PackageVersion => {
	try {
		const json = JSON.parse(readFileSync(path, "utf8")) as {
			version?: string;
		};
		return { path, version: json.version };
	} catch (error) {
		return { path, version: undefined };
	}
};

const formatVersionSummary = (entries: PackageVersion[]): string => {
	const versions = Array.from(
		new Set(
			entries
				.map((entry) => entry.version)
				.filter((value): value is string => typeof value === "string"),
		),
	).sort();

	if (versions.length === 0) {
		return "missing";
	}

	if (versions.length === 1) {
		return versions[0]!;
	}

	return `mixed (${versions.join(", ")})`;
};

export const versionsCommand = command({
	name: "versions",
	desc: "List the current package versions for each release track",
	handler: () => {
		for (const { config } of releaseGroups) {
			const packages =
				config.packageJsonPaths?.map(readPackageVersion) ?? [];
			const summary = formatVersionSummary(packages);

			console.log(`${config.displayName}: ${summary}`);
			for (const pkg of packages) {
				const label = pkg.version ?? "missing version";
				console.log(`  - ${pkg.path}: ${label}`);
			}
			if (packages.length === 0) {
				console.log("  (no package.json paths configured)");
			}
		}
	},
});
