import { createReleaseCommand } from "./common";

export const sdkCommand = createReleaseCommand({
	name: "sdk",
	desc: "Create a GitHub release for the SDK package",
	tagPrefix: "sdk",
	displayName: "SDK",
});
