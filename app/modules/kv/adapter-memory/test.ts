import { KeyValueMemoryAdapter } from "./index";
import { runKeyValueAdapterContractTests } from "@infrakit-team/module-kv-test";

runKeyValueAdapterContractTests("KeyValueMemoryAdapter", () => {
	return new KeyValueMemoryAdapter();
});
