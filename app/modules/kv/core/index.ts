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

export type KeyValue = KeyValueClient & KeyValueDashboard;

export type KeyValueClient = {
	get(input: { key: string }): Promise<string | undefined>;
	set(input: {
		key: string;
		value: string;
		option?: KeyValueOption;
	}): Promise<boolean>;
	del(input: { key: string }): Promise<boolean>;
};

export type KeyValueDashboard = {
	_dashboard: {
		list(input: {
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
		}>;
		count(): Promise<number>;
		view(input: {
			key: string;
		}): Promise<(KeyValueItem & { key: string }) | undefined>;
		deleteBulk(input: { keys: string[] }): Promise<boolean>;
	};
};
