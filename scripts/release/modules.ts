import { command } from "@drizzle-team/brocli";
import { kvCommand } from "./modules/kv";

export const modulesCommand = command({
	name: "modules",
	desc: "Release helpers for server-side modules",
	subcommands: [kvCommand],
	handler: () => {
		console.log("Specify a modules subcommand. Try `--help` for usage.");
	},
});
