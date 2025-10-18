#!/usr/bin/env bun
import { $ } from "bun";
import { command, run } from "@drizzle-team/brocli";
import { uiCommand } from "./ui";

$.throws(true);

const releaseCommand = command({
	name: "release",
	desc: "Release automation utilities",
	subcommands: [uiCommand],
	handler: () => {
		console.log("Specify a subcommand. Try `--help` for usage.");
	},
});

async function main() {
	try {
		await run([releaseCommand], {
			name: "bun run scripts/release/index.ts",
			description: "Infrakit release helpers",
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error(error);
		}
		process.exit(1);
	}
}

await main();
