import { ExpressDashboardAdapter } from "@infrakit/adapter/express";
import { KeyValueMemoryAdapter } from "@infrakit/modules/kv";
import { InfraKit } from "@infrakit/sdk";
import express from "express";
import { getData } from "./seed";

const infrakit = new InfraKit({
	keyValue: {
		adapter: new KeyValueMemoryAdapter(),
	},
});

const expressAdapter = new ExpressDashboardAdapter({
	baseUrl: "/dashboard",
	infrakit,
});

for (const item of getData()) {
	infrakit.keyValue.set(item);
}

const app = express();
app.use("/dashboard", expressAdapter.endpoint);
app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(3000, () => {
	console.log(`Example app listening on port 3000`);
});
