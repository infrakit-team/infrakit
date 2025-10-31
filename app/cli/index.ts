#!/usr/bin/env node

import { command, run } from "@drizzle-team/brocli";
import { keyValue } from "./modules/key-value";
import packageJson from "./package.json" assert { type: "json" };

const generate = command({
	name: "create",
	subcommands: [keyValue],
});

run([generate], {
	description: "CLI to help setup infrakit",
	version: packageJson.version,
});
