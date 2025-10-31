import { command, string } from "@drizzle-team/brocli";
import type { ColumnType, Generated } from "kysely";
import { createKeyValueTable } from "./postgres";

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
				await createKeyValueTable({ url: opts.url });
				break;
			case "mysql":
			case "sqlite":
			default:
				break;
		}
	},
});

export interface KeyValueTable {
	id: Generated<number>;
	key: string;
	value: string | null;
	created_at: ColumnType<Date, string | undefined, never>;
	time_to_live_in_epoch: number | null;
}

export interface Database {
	"infrakit_module.key_value": KeyValueTable;
}
