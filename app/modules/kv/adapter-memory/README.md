# KV Memory Adapter (`@infrakit-team/module-kv-memory`)

This package provides the zero-dependency, in-memory adapter for the Infrakit KV module. Pair it with `@infrakit-team/modules/kv` to add durable key-value storage and dashboard metrics to your application without provisioning external infrastructure.

## Features

-   **Drop-in default**: Plug-and-play adapter for local development, testing, or caching scenarios.
-   **Dashboard ready**: Exposes the metrics and data viewers required by the Infrakit dashboard.
-   **Comprehensive typings**: Implements the shared `KeyValue` interface from `@infrakit-team/modules/kv`.

## Installation

```bash
bun add @infrakit-team/module-kv-memory @infrakit-team/modules/kv @infrakit-team/sdk
```

## Usage

```typescript
import { KeyValueMemoryAdapter } from "@infrakit-team/module-kv-memory";
import { InfraKit } from "@infrakit-team/sdk";

const infrakit = new InfraKit({
  keyValue: new KeyValueMemoryAdapter(),
});

const kv = infrakit.keyValue;

kv.set({ key: "user:1", value: JSON.stringify({ name: "Alex" }) });
const user = kv.get({ key: "user:1" });
```

## Related Packages

-   `@infrakit-team/modules/kv`: Core KV types and client.
-   `@infrakit-team/modules/kv/test`: Helpers for testing KV integrations.
