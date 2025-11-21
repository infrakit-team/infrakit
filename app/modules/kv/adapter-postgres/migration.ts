import { consola } from "consola";
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import type { Database } from "./schema";

export async function createKeyValueTable(input: { url: string }) {
	new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({ connectionString: input.url }),
		}),
	})
		.connection()
		.execute(async (db) => {
			consola.start("Creating the schema...");
			await db.schema
				.createSchema("infrakit_module")
				.execute()
				.then(() => consola.success("Created the schema"))
				.catch((error) => {
					if (error.message.includes("already exists")) {
						consola.warn("Schema already exist, skipping");
						return;
					}
					consola.error("Failed to create schema: ", error);
				});
			consola.start("Creating the key value table...");
			await db.schema
				.createTable("infrakit_module.key_value")
				.addColumn("id", "serial", (col) => col.primaryKey())
				.addColumn("key", "varchar", (col) => col.notNull().unique())
				.addColumn("value", "varchar", (col) => col.notNull())
				.addColumn("created_at", "timestamp", (col) =>
					col.defaultTo(sql`now()`).notNull(),
				)
				.addColumn("time_to_live_in_ms", "numeric")
				.execute()
				.then(() => consola.success("Created the table"))
				.catch((error) => {
					if (error.message.includes("already exists")) {
						consola.warn("Table already exist, skipping");
						return;
					}
					consola.error("Failed to create table", error);
				});
			db.destroy();
		});
}

export async function dropKeyValueTable(input: { url: string }) {
	new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({ connectionString: input.url }),
		}),
	})
		.connection()
		.execute(async (db) => {
			consola.start("Deleting the key value table...");
			await db.schema
				.dropTable("infrakit_module.key_value")
				.execute()
				.then(() => consola.success("Deleted the table"))
				.catch((error) => consola.error("Failed to delete table", error));
			db.destroy();
		});
}

export async function resetKeyValueTable(input: { url: string }) {
	new Kysely<Database>({
		dialect: new PostgresDialect({
			pool: new Pool({ connectionString: input.url }),
		}),
	})
		.connection()
		.execute(async (db) => {
			consola.start("Deleting the key value table...");
			await sql`TRUNCATE "infrakit_module"."key_value"`
				.execute({ getExecutor: db.getExecutor })
				.then(() => consola.success("Deleted the table"))
				.catch((error) => consola.error("Failed to delete table", error));
			db.destroy();
		});
}
