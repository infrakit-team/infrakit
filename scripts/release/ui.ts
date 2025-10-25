import { createReleaseCommand, type ReleaseCommandConfig } from "./common";

export const uiReleaseConfig: ReleaseCommandConfig = {
	name: "ui",
	desc: "Create a GitHub release for the UI package",
	tagPrefix: "ui",
	displayName: "UI",
	packageJsonPaths: [
		"app/ui/core/package.json",
		"app/ui/adapter-express/package.json",
		"app/ui/adapter-hono/package.json",
	],
};

export const uiCommand = createReleaseCommand(uiReleaseConfig);
