import { command, run } from "@drizzle-team/brocli";
import { keyValue } from "./modules/key-value";

const generate = command({
	name: "create",
	subcommands: [keyValue],
});

run([generate], {
	description: "CLI to help setup infrakit",
	version: "0.1.0",
});
