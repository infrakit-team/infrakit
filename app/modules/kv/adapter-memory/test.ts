import { KeyValueMemoryAdapter } from "./index";
import { runKeyValueAdapterContractTests } from "./keyvalue.contract";

runKeyValueAdapterContractTests("KeyValueMemoryAdapter", () => {
	return new KeyValueMemoryAdapter();
});
