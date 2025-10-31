import { createReleaseCommand, type ReleaseCommandConfig } from "./common";

export const cliReleaseConfig: ReleaseCommandConfig = {
	name: "cli",
	desc: "Create a GitHub release for the CLI package",
	tagPrefix: "cli",
	displayName: "CLI",
	packageJsonPaths: ["app/cli/package.json"],
};

export const cliCommand = createReleaseCommand(cliReleaseConfig);
