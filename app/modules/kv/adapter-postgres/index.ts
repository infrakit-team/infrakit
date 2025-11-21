import type {
	KeyValue,
	KeyValueItem,
	KeyValueOption,
} from "@infrakit-team/module-kv";
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import type { Database } from "./schema";

export class KeyValuePostgresAdapter implements KeyValue {
	readonly #db;

	constructor(input: { connectionString: string }) {
		this.#db = new Kysely<Database>({
			dialect: new PostgresDialect({
				pool: new Pool({ connectionString: input.connectionString }),
			}),
		});
	}

	async del(input: { key: string }) {
		const id = await this.#db
			.deleteFrom("infrakit_module.key_value")
			.where("infrakit_module.key_value.key", "=", input.key)
			.returning("id")
			.executeTakeFirst();

		if (!id) return false;
		return true;
	}

	async get(input: { key: string }): Promise<string | undefined> {
		const item = await this.#db
			.selectFrom("infrakit_module.key_value")
			.selectAll()
			.where("infrakit_module.key_value.key", "=", input.key)
			.executeTakeFirst();

		if (!item) {
			return undefined;
		}

		if (item.time_to_live_in_ms) {
			const ttl = Number(item.time_to_live_in_ms);
			const createdAt = new Date(item.created_at).getTime();
			const expiresAt = createdAt + ttl;

			if (Date.now() >= expiresAt) {
				await this.del({ key: input.key });
				return undefined;
			}
		}

		return item.value;
	}

	async set(input: {
		key: string;
		value: string;
		option?: KeyValueOption;
	}): Promise<boolean> {
		return this.#db
			.insertInto("infrakit_module.key_value")
			.values({
				value: input.value,
				key: input.key,
				time_to_live_in_ms: input.option?.timeToLiveInMs,
			})
			.onConflict((oc) =>
				oc.column("key").doUpdateSet({
					value: input.value,
					time_to_live_in_ms: input.option?.timeToLiveInMs,
				}),
			)
			.execute()
			.then(() => true)
			.catch((error) => {
				console.log({ error });
				return false;
			});
	}

	_dashboard = {
		count: async (): Promise<number> => {
			const result = await this.#db
				.selectFrom("infrakit_module.key_value")
				.select(({ fn }) => [fn.count("id").as("count")])
				.where((eb) =>
					eb.or([
						eb("infrakit_module.key_value.time_to_live_in_ms", "is", null),
						sql<boolean>`extract(epoch from infrakit_module.key_value.created_at) * 1000 + infrakit_module.key_value.time_to_live_in_ms > ${Date.now()}`,
					]),
				)
				.executeTakeFirst();
			return Number(result?.count ?? 0);
		},
		list: async (input: {
			filter?: { key?: string };
			sort?: {
				key?: "asc" | "desc";
				value?: "asc" | "desc";
				created?: "asc" | "desc";
			};
			paginate: { pageSize: number; pageIndex: number };
		}) => {
			const { paginate, sort, filter } = input;

			let query = this.#db.selectFrom("infrakit_module.key_value").selectAll();

			// Apply filter
			if (filter?.key) {
				query = query.where("key", "ilike", `%${filter.key}%`);
			}

			// Apply sorting
			if (sort?.key) {
				query = query.orderBy("key", sort.key);
			}
			if (sort?.value) {
				query = query.orderBy("value", sort.value);
			}
			if (sort?.created) {
				query = query.orderBy("created_at", sort.created);
			}

			// Get total count
			const countResult = await this.#db
				.selectFrom("infrakit_module.key_value")
				.select(({ fn }) => [fn.count("id").as("count")])
				.where((eb) => {
					if (filter?.key) {
						return eb("key", "ilike", `%${filter.key}%`);
					}
					return eb.and([]);
				})
				.executeTakeFirst();
			const count = Number(countResult?.count ?? 0);

			// Apply pagination
			const offset = paginate.pageIndex * paginate.pageSize;
			const items = await query
				.limit(paginate.pageSize)
				.offset(offset)
				.execute();

			return {
				data: items.map((item) => ({
					key: item.key,
					value: item.value,
					meta: {
						createdAtIso: item.created_at.toISOString(),
						timeToLiveInMs: item.time_to_live_in_ms ?? undefined,
					},
				})),
				count,
			};
		},

		view: async (input: {
			key: string;
		}): Promise<(KeyValueItem & { key: string }) | undefined> => {
			const item = await this.#db
				.selectFrom("infrakit_module.key_value")
				.selectAll()
				.where("key", "=", input.key)
				.executeTakeFirst();

			if (!item) {
				return undefined;
			}

			return {
				key: item.key,
				value: item.value,
				meta: {
					createdAtIso: item.created_at.toISOString(),
					timeToLiveInMs: item.time_to_live_in_ms ?? undefined,
				},
			};
		},

		deleteBulk: async (input: { keys: string[] }): Promise<boolean> => {
			return this.#db
				.deleteFrom("infrakit_module.key_value")
				.where("key", "in", input.keys)
				.execute()
				.then(() => true)
				.catch(() => false);
		},
	};

	_test = {
		reset: async () => {
			await sql`TRUNCATE "infrakit_module"."key_value"`.execute(this.#db);
		},
	};
}
