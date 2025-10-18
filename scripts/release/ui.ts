import { createReleaseCommand } from "./common";

export const uiCommand = createReleaseCommand({
	name: "ui",
	desc: "Create a GitHub release for the UI package",
	tagPrefix: "ui",
	displayName: "UI",
});
