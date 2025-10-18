import { createReleaseCommand } from "../common";

export const kvCommand = createReleaseCommand({
	name: "kv",
	desc: "Create a GitHub release for the KV modules",
	tagPrefix: "kv",
	displayName: "KV",
});
