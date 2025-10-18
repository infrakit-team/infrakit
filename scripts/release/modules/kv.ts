import { createReleaseCommand } from "../common";

export const kvCommand = createReleaseCommand({
	name: "kv",
	desc: "Create a GitHub release for the KV modules",
	tagPrefix: "kv",
	displayName: "KV",
	packageJsonPaths: [
		"app/modules/kv/core/package.json",
		"app/modules/kv/adapter-memory/package.json",
	],
});
