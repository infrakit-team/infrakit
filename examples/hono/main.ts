import { KeyValueMemoryAdapter } from "@infrakit-team/module-kv-memory";
import { InfraKit } from "@infrakit-team/sdk";
import { HonoDashboardAdapter } from "@infrakit-team/ui-hono";
import { Hono } from "hono";
import { getData } from "./seed";

const infrakit = new InfraKit({
	keyValue: new KeyValueMemoryAdapter(),
});

const honoAdapter = new HonoDashboardAdapter({
	baseUrl: "/admin",
	infrakit,
});

for (const item of getData()) {
	infrakit.keyValue.set(item);
}

const app = new Hono();
app.route("/admin", honoAdapter.endpoint);
export default app;
