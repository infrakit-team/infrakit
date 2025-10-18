import type { InfraKit } from "@infrakit/sdk";
import { Hono } from "hono";

export class HonoDashboardAdapter {
	readonly #infrakit: InfraKit;
	readonly #baseUrl: string;

	constructor(config: {
		infrakit: InfraKit;
		baseUrl: string;
	}) {
		this.#infrakit = config.infrakit;
		this.#baseUrl = config.baseUrl;
	}

	get endpoint() {
		const app = new Hono();
		const enabledModules = {
			keyValue: Boolean(this.#infrakit.keyValue),
		};

		if (enabledModules.keyValue && this.#infrakit.keyValue) {
			app.get("/api/kv/stats", (c) => {
				const timeRange = c.req.query("timeRange") || "1h";
				return c.json(this.#infrakit.dashboard.keyValue?.stats(timeRange));
			});

			app.get("/api/kv/list", (c) => {
				return c.json(
					this.#infrakit.dashboard.keyValue?.list({
						paginate: {
							pageIndex: Number(c.req.query("pageIndex")) || 0,
							pageSize: Number(c.req.query("pageSize")) || 10,
						},
						filter: {
							key: c.req.query("filterKey"),
						},
						sort: {
							key: c.req.query("sortKey") as "asc" | "desc",
							value: c.req.query("sortValue") as "asc" | "desc",
							created: c.req.query("sortCreated") as "asc" | "desc", // Fixed typo: was "sortVreated"
						},
					}),
				);
			});

			app.get("/api/kv/count", (c) => {
				return c.json({ count: this.#infrakit.dashboard.keyValue?.count() });
			});

			app.get("/api/kv/:key", (c) => {
				const key = c.req.param("key");
				const item = this.#infrakit.dashboard.keyValue?.view({ key });
				return item !== undefined ? c.json(item) : c.notFound();
			});

			app.post("/api/kv/delete-keys", async (c) => {
				const { keys } = await c.req.json();
				const success = this.#infrakit.dashboard.keyValue?.deleteBulk({ keys });
				return c.json({ success, pee: "poo" });
			});

			app.post("/api/kv/:key", async (c) => {
				const key = c.req.param("key");
				const { value } = await c.req.json();
				const success = this.#infrakit.keyValue?.set({ key, value });
				return c.json({ success });
			});

			app.delete("/api/kv/:key", (c) => {
				const key = c.req.param("key");
				const success = this.#infrakit.keyValue?.del({ key });
				return c.json({ success });
			});
		}

		app.get("/*", (c) => {
			return c.html(createHtml({ baseUrl: this.#baseUrl, enabledModules }));
		});

		return app;
	}
}

const createHtml = (input: {
	baseUrl: string;
	enabledModules: {
		keyValue: boolean;
	};
}) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Infrakit</title>
    <link href="http://localhost:3005/dist/assets/index.css" rel="stylesheet">
  </head>
  <body>
    <div id="app"></div>
    <script>
      window.__INITIAL_STATE__ = {
        apiUrl: "${input.baseUrl}/api",
        basename: "${input.baseUrl}",
        enabledModules: ${JSON.stringify(input.enabledModules)}
      };
    </script>
    <script type="module" src="http://localhost:3005/dist/assets/index.js"></script>
  </body>
</html>
`;
