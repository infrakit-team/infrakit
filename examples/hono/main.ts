import { KeyValuePostgresAdapter } from "@infrakit-team/module-kv-postgres";
import { InfraKit } from "@infrakit-team/sdk";
import { HonoDashboardAdapter } from "@infrakit-team/ui-hono";
import { Hono } from "hono";
import { getData } from "./seed";

const infrakit = new InfraKit({
	keyValue: new KeyValuePostgresAdapter({
		connectionString: "postgresql://postgres:postgres@localhost:5432/sauce",
	}),
});

const honoAdapter = new HonoDashboardAdapter({
	baseUrl: "/admin",
	infrakit,
});

async function seedData() {
	console.log("Seeding data");
	for (const item of getData()) {
		await infrakit.keyValue.set(item);
	}
}

const prev = performance.now();
await seedData();
console.log(`Seeding took ${performance.now() - prev}ms`);

const app = new Hono();
app.route("/admin", honoAdapter.endpoint);
export default app;
