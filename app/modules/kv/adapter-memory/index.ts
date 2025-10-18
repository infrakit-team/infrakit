import type {
	KeyValue,
	KeyValueItem,
	KeyValueOption,
} from "@infrakit-team/modules/kv";

export class KeyValueMemoryAdapter implements KeyValue {
	private readonly map = new Map<string, KeyValueItem>();

	del(input: { key: string }): boolean {
		return this.map.delete(input.key);
	}

	get(input: { key: string }): string | undefined {
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

	set(input: { key: string; value: string; option?: KeyValueOption }): boolean {
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

	dashboard = {
		count: () => this.map.size,

		list: (input: {
			filter?: { key?: string };
			sort?: {
				key?: "asc" | "desc";
				value?: "asc" | "desc";
				created?: "asc" | "desc";
			};
			paginate: { pageSize: number; pageIndex: number };
		}) => {
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

		view: (input: {
			key: string;
		}): (KeyValueItem & { key: string }) | undefined => {
			const item = this.map.get(input.key);
			if (!item) {
				return undefined;
			}
			return { key: input.key, ...item };
		},

		deleteBulk: (input: { keys: string[] }): boolean => {
			for (const key of input.keys) {
				this.map.delete(key);
			}
			return true;
		},
	};
}
