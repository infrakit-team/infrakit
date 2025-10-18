# KV Test Utilities (`@infrakit-team/modules/kv/test`)

This package provides shared test contracts for verifying KV adapters. Use it inside repository packages or downstream applications to ensure custom adapters satisfy the behaviours required by the dashboard and client SDKs.

## Installation

```bash
bun add -d @infrakit-team/modules/kv/test @infrakit-team/modules/kv
```

## Usage

```typescript
import { runKeyValueAdapterContractTests } from "@infrakit-team/modules/kv/test";
import { KeyValueMemoryAdapter } from "@infrakit-team/module-kv-memory";

runKeyValueAdapterContractTests("memory adapter", () => new KeyValueMemoryAdapter());
```

Swap in your own factory function to assert that a custom adapter implements the full contract.
