import { createReleaseCommand, type ReleaseCommandConfig } from "../common";

export const kvReleaseConfig: ReleaseCommandConfig = {
	name: "kv",
	desc: "Create a GitHub release for the KV modules",
	tagPrefix: "kv",
	displayName: "KV",
	packageJsonPaths: [
		"app/modules/kv/adapter-memory/package.json",
		"app/modules/kv/core/package.json",
	],
};

export const kvCommand = createReleaseCommand(kvReleaseConfig);
