import type { KeyValue, KeyValueClient } from "@infrakit-team/module";

type InfraKitConfig = {
	keyValue?: KeyValue;
};

type ExtractKeyValueAdapter<T> = T extends KeyValue
	? KeyValueClient
	: undefined;

export class InfraKit<T extends InfraKitConfig = InfraKitConfig> {
	readonly #keyValue: T["keyValue"];

	constructor(config: T) {
		this.#keyValue = config.keyValue;
	}

	get keyValue(): ExtractKeyValueAdapter<T["keyValue"]> {
		return this.#keyValue as ExtractKeyValueAdapter<T["keyValue"]>;
	}

	get dashboard() {
		return {
			keyValue: this.#keyValue?.dashboard,
		};
	}
}
