import type { KeyValue, KeyValueClient } from "@infrakit/modules/kv";

type InfraKitConfig = {
	keyValue?: {
		adapter: KeyValue;
	};
};

type ExtractKeyValueAdapter<T> = T extends { adapter: KeyValue }
	? KeyValueClient
	: undefined;

export class InfraKit<T extends InfraKitConfig = InfraKitConfig> {
	readonly #keyValue: T["keyValue"];

	constructor(config: T) {
		this.#keyValue = config.keyValue;
	}

	get keyValue(): ExtractKeyValueAdapter<T["keyValue"]> {
		return this.#keyValue?.adapter as ExtractKeyValueAdapter<T["keyValue"]>;
	}

	get dashboard() {
		return {
			keyValue: this.#keyValue?.adapter.dashboard,
		};
	}
}
