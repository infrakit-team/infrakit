import { createReleaseCommand } from "./common";

export const sdkCommand = createReleaseCommand({
	name: "sdk",
	desc: "Create a GitHub release for the SDK package",
	tagPrefix: "sdk",
	displayName: "SDK",
	packageJsonPaths: ["app/sdk/package.json"],
	publishDirs: ["app/sdk"],
});
