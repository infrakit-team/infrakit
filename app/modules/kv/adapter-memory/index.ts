import type {
	KeyValue,
	KeyValueItem,
	KeyValueOption,
} from "@infrakit-team/module-kv";

export class KeyValueMemoryAdapter implements KeyValue {
	private readonly map = new Map<string, KeyValueItem>();

	async del(input: { key: string }): Promise<boolean> {
		return this.map.delete(input.key);
	}

	async get(input: { key: string }): Promise<string | undefined> {
		const item = this.map.get(input.key);

		if (!item) {
			return undefined;
		}

		if (
			item.meta.timeToLiveInMs &&
			Date.now() >
				new Date(item.meta.createdAtIso).getTime() + item.meta.timeToLiveInMs
		) {
			this.map.delete(input.key);
			return undefined;
		}

		return item.value;
	}

	async set(input: {
		key: string;
		value: string;
		option?: KeyValueOption;
	}): Promise<boolean> {
		try {
			this.map.set(input.key, {
				value: input.value,
				meta: {
					createdAtIso: new Date().toISOString(),
					timeToLiveInMs: input.option?.timeToLiveInMs,
				},
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	_dashboard = {
		count: async () => this.map.size,

		list: async (input: {
			filter?: { key?: string };
			sort?: {
				key?: "asc" | "desc";
				value?: "asc" | "desc";
				created?: "asc" | "desc";
			};
			paginate: { pageSize: number; pageIndex: number };
		}): Promise<{
			data: Array<KeyValueItem & { key: string }>;
			count: number;
		}> => {
			const { paginate, sort, filter } = input;
			let entries = Array.from(this.map.entries());

			if (filter?.key) {
				entries = entries.filter(([key]) => {
					return key.toLowerCase().includes(filter.key?.toLowerCase() ?? "");
				});
			}

			if (sort?.key) {
				entries = entries.sort(([aKey], [bKey]) => {
					if (sort.key === "asc") {
						return aKey < bKey ? -1 : 1;
					} else {
						return aKey < bKey ? 1 : -1;
					}
				});
			}

			if (sort?.value) {
				entries = entries.sort(([, aVal], [, bVal]) => {
					if (sort.value === "asc") {
						return aVal.value < bVal.value ? -1 : 1;
					} else {
						return aVal.value < bVal.value ? 1 : -1;
					}
				});
			}

			if (sort?.created) {
				entries = entries.sort(([, aVal], [, bVal]) => {
					if (sort.created === "asc") {
						return aVal.meta.createdAtIso < bVal.meta.createdAtIso ? -1 : 1;
					} else {
						return aVal.meta.createdAtIso < bVal.meta.createdAtIso ? 1 : -1;
					}
				});
			}

			const start = paginate.pageIndex * paginate.pageSize;
			const end = start + paginate.pageSize;

			return {
				data: entries
					.slice(start, end)
					.map(([key, item]) => ({ key, value: item.value, meta: item.meta })),
				count: entries.length,
			};
		},

		view: async (input: {
			key: string;
		}): Promise<(KeyValueItem & { key: string }) | undefined> => {
			const item = this.map.get(input.key);
			if (!item) {
				return undefined;
			}
			return { key: input.key, ...item };
		},

		deleteBulk: async (input: { keys: string[] }): Promise<boolean> => {
			for (const key of input.keys) {
				this.map.delete(key);
			}
			return true;
		},
	};
}
