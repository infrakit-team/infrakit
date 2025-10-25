import { command } from "@drizzle-team/brocli";
import { kvCommand } from "./modules/kv";

export const moduleCommand = command({
	name: "module",
	desc: "Release helpers for server-side modules",
	subcommands: [kvCommand],
	handler: () => {
		console.log("Specify a module subcommand. Try `--help` for usage.");
	},
});
