export type KeyValueMeta = {
	createdAtIso: string; // ISO format
	timeToLiveInMs?: number;
};

export type KeyValueItem = {
	value: string;
	meta: KeyValueMeta;
};

export type KeyValueOption = {
	timeToLiveInMs?: number;
};

export type KeyValueStats = {
	totalKeys: number;
	storageUsed: string;
	hitRate: number;
	totalKeysChange: number;
	hitRateChange: number;
	operationsHistory: number[];
	labels: string[];
};

export type KeyValue = KeyValueClient & KeyValueDashboard;

export type KeyValueClient = {
	get(input: { key: string }): string | undefined;
	set(input: { key: string; value: string; option?: KeyValueOption }): boolean;
	del(input: { key: string }): boolean;
};

export type KeyValueDashboard = {
	dashboard: {
		list(input: {
			filter?: { key?: string };
			sort?: {
				key?: "asc" | "desc";
				value?: "asc" | "desc";
				created?: "asc" | "desc";
			};
			paginate: { pageSize: number; pageIndex: number };
		}): {
			data: Array<KeyValueItem & { key: string }>;
			count: number;
		};
		count(): number;
		stats(timeRange: string): KeyValueStats;
		view(input: { key: string }): (KeyValueItem & { key: string }) | undefined;
		deleteBulk(input: { keys: string[] }): boolean;
	};
};
