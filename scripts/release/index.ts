#!/usr/bin/env bun
import { $ } from "bun";
import { command, run } from "@drizzle-team/brocli";
import { uiCommand } from "./ui";
import { sdkCommand } from "./sdk";
import { modulesCommand } from "./modules";

$.throws(true);

const showStack = (() => {
	const flag = (process.env.RELEASE_DEBUG ?? process.env.DEBUG_RELEASE ?? "").toLowerCase();
	return flag === "1" || flag === "true" || flag === "yes";
})();

const releaseCommand = command({
	name: "release",
	desc: "Release automation utilities",
	subcommands: [uiCommand, sdkCommand, modulesCommand],
	handler: () => {
		console.log("Specify a subcommand. Try `--help` for usage.");
	},
});

const isStepError = (error: Error) => error.name === "StepError";

const logError = (error: unknown) => {
	if (error instanceof Error) {
		console.error(error.message);
		if (!isStepError(error) && showStack && error.stack) {
			console.error(error.stack);
		}
	} else {
		console.error(String(error));
	}
};

async function main() {
	try {
		await run([releaseCommand], {
			name: "bun run scripts/release/index.ts",
			description: "Infrakit release helpers",
		});
	} catch (error) {
		logError(error);
		process.exit(1);
	}
}

await main();
