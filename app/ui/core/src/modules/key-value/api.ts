import type { KeyValueStats } from "@infrakit/modules/kv";
import { config } from "../../shared/config";

export const api = {
	list: async (input: {
		filter?: { key?: string };
		sort?: {
			key?: "asc" | "desc";
			value?: "asc" | "desc";
			created?: "asc" | "desc";
		};
		paginate: { pageSize: number; pageIndex: number };
	}) => {
		const { filter, paginate, sort } = input;
		const searchParams = new URLSearchParams();

		if (filter?.key) {
			searchParams.set("filterKey", filter.key);
		}
		if (sort?.key) {
			searchParams.set("sortKey", sort.key);
		}
		if (sort?.value) {
			searchParams.set("sortValue", sort.value);
		}
		if (sort?.created) {
			searchParams.set("sortCreated", sort.created);
		}
		searchParams.set("pageIndex", String(paginate.pageIndex));
		searchParams.set("pageSize", String(paginate.pageSize));

		const res = await fetch(
			`${config.apiUrl}/kv/list?` + searchParams.toString(),
		);
		return (await res.json()) as {
			data: {
				key: string;
				value: string;
				meta: {
					createdAtIso: string;
					timeToLiveInMs: number;
				};
			}[];
			count: number;
		};
	},

	stats: async (timeRange: string) => {
		const url = `${config.apiUrl}/kv/stats?timeRange=${timeRange}`;
		const res = await fetch(url);
		return (await res.json()) as KeyValueStats;
	},

	view: async (key?: string) => {
		if (!key) {
			return;
		}
		const url = `${config.apiUrl}/kv/${key}`;
		console.log({ url, key });
		const res = await fetch(url);
		return (await res.json()) as { key: string; value: string };
	},

	count: async () => {
		const url = `${config.apiUrl}/kv/count`;
		const res = await fetch(url);
		return (await res.json()) as { count: number };
	},

	set: async (key: string, value: string) => {
		const url = `${config.apiUrl}/kv/${key}`;
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ value }),
		});
		return await res.json();
	},

	del: async (key: string) => {
		const url = `${config.apiUrl}/kv/${key}`;
		const res = await fetch(url, { method: "DELETE" });
		return await res.json();
	},

	deleteBulk: async (keys: string[]) => {
		const url = `${config.apiUrl}/kv/delete-keys`;
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ keys }),
		});
		return await res.json();
	},
};
