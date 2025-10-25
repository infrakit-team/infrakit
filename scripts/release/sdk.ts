import { createReleaseCommand, type ReleaseCommandConfig } from "./common";

export const sdkReleaseConfig: ReleaseCommandConfig = {
	name: "sdk",
	desc: "Create a GitHub release for the SDK package",
	tagPrefix: "sdk",
	displayName: "SDK",
	packageJsonPaths: ["app/sdk/package.json"],
};

export const sdkCommand = createReleaseCommand(sdkReleaseConfig);
