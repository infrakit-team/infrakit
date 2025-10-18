import type { InfraKit } from "@infrakit-team/sdk";
import express, { type Request, type Response, type Router } from "express";

export class ExpressDashboardAdapter {
	readonly #infrakit: InfraKit;
	readonly #baseUrl: string;

	constructor(config: {
		infrakit: InfraKit;
		baseUrl: string;
	}) {
		this.#infrakit = config.infrakit;
		this.#baseUrl = config.baseUrl;
	}

	get endpoint(): Router {
		const router = express.Router();

		router.use(express.json());

		const enabledModules = {
			keyValue: Boolean(this.#infrakit.keyValue),
		};

		if (enabledModules.keyValue) {
			router.get("/api/kv/stats", (req: Request, res: Response) => {
				const timeRange = (req.query.timeRange as string) || "1h";
				return res.json(this.#infrakit.dashboard.keyValue?.stats(timeRange));
			});

			router.get("/api/kv/list", (req: Request, res: Response) => {
				return res.json(
					this.#infrakit.dashboard.keyValue?.list({
						paginate: {
							pageIndex: Number(req.query.pageIndex) || 0,
							pageSize: Number(req.query.pageSize) || 10,
						},
						filter: {
							key: req.query.filterKey as string | undefined,
						},
						sort: {
							key: req.query.sortKey as "asc" | "desc" | undefined,
							value: req.query.sortValue as "asc" | "desc" | undefined,
							created: req.query.sortCreated as "asc" | "desc" | undefined,
						},
					}),
				);
			});

			router.get("/api/kv/count", (_, res: Response) => {
				return res.json({ count: this.#infrakit.dashboard.keyValue?.count() });
			});

			router.get("/api/kv/:key", (req: Request, res: Response) => {
				const key = req.params.key as string;
				const item = this.#infrakit.dashboard.keyValue?.view({ key });
				return item !== undefined
					? res.json(item)
					: res.status(404).json({ error: "Not found" });
			});

			router.post("/api/kv/delete-keys", (req: Request, res: Response) => {
				const { keys } = req.body;
				console.log({ apiDeletedKeys: keys });
				const success = this.#infrakit.dashboard.keyValue?.deleteBulk({ keys });
				return res.json({ success });
			});

			router.post("/api/kv/:key", (req: Request, res: Response) => {
				const key = req.params.key as string;
				const { value } = req.body;
				const success = this.#infrakit.keyValue?.set({ key, value });
				return res.json({ success });
			});

			router.delete("/api/kv/:key", (req: Request, res: Response) => {
				const key = req.params.key as string;
				const success = this.#infrakit.keyValue?.del({ key });
				return res.json({ success });
			});
		}

		router.get("/", (_, res: Response) => {
			return res.send(createHtml({ baseUrl: this.#baseUrl, enabledModules }));
		});

		return router;
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
    <link href="https://unpkg.com/@infrakit-team/ui@latest/dist/index.css" rel="stylesheet">
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
    <script type="module" src="https://unpkg.com/@infrakit-team/ui@latest/dist/index.js"></script>
  </body>
</html>
`;
