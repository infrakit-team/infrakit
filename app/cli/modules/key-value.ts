import { command, string } from "@drizzle-team/brocli";
import * as postgres from "@infrakit-team/module-kv-postgres/migration";

export const keyValue = command({
	name: "key-value",
	options: {
		dialect: string()
			.enum("postgresql", "mysql", "sqlite")
			.desc(`Dialect of database "postgresql", "mysql", "sqlite"`)
			.alias("d")
			.required(),
		url: string().desc("URL of database").alias("u").required(),
	},
	handler: async (opts) => {
		switch (opts.dialect) {
			case "postgresql":
				await postgres.createKeyValueTable({ url: opts.url });
				break;
			case "mysql":
			case "sqlite":
			default:
				break;
		}
	},
});
