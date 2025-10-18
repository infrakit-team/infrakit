import { HonoDashboardAdapter } from "@infrakit/adapter/hono";
import { KeyValueMemoryAdapter } from "@infrakit/modules/kv";
import { InfraKit } from "@infrakit/sdk";
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
