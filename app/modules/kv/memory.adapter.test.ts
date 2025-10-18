import { KeyValueMemoryAdapter } from "./memory.adapter";
import { runKeyValueAdapterContractTests } from "./keyvalue.contract";

runKeyValueAdapterContractTests("KeyValueMemoryAdapter", () => {
	return new KeyValueMemoryAdapter();
});
