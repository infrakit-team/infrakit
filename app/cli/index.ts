import { boolean, command, run, string } from "@drizzle-team/brocli";

const migrate = command({
	name: "migrate",
	options: {
		module: string().enum("key-value"),
		dialect: string().enum("postgresql", "mysql", "sqlite"),
	},
	handler: (opts) => {
		console.log({ opts });
	},
});

const generate = command({
	name: "generate",
	options: {
		module: string().enum("key-value"),
		dialect: string().enum("postgresql", "mysql", "sqlite"),
	},
	handler: (opts) => {
		console.log({ opts });
	},
});

run([migrate, generate]);
