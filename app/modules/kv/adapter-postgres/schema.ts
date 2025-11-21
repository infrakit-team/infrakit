import type { ColumnType, Generated } from "kysely";

export interface KeyValueTable {
	id: Generated<number>;
	key: string;
	value: string;
	created_at: ColumnType<Date, string | undefined, never>;
	time_to_live_in_ms: number | null;
}

export interface Database {
	"infrakit_module.key_value": KeyValueTable;
}
