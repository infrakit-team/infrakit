# Key-Value Module (`@infrakit-team/modules/kv`)

This package provides a powerful Key-Value storage module for Infrakit, complete with a client SDK, a default in-memory adapter, and a full-featured dashboard interface.

## Features

-   **Simple Client SDK**: `get`, `set`, and `del` methods for easy data manipulation.
-   **Time-To-Live (TTL)**: Set an automatic expiration time for any key.
-   **In-Memory Adapter**: Pair with `@infrakit-team/module-kv-memory` for fast, zero-dependency storage.
-   **Dashboard Integration**: Automatically integrates with the Infrakit dashboard to provide statistics, real-time monitoring, and data management tools.

## Installation

```bash
bun add @infrakit-team/modules/kv @infrakit-team/module-kv-memory @infrakit-team/sdk
```

## Usage

### 1. Initialize with an Adapter

To use the Key-Value module, initialize `InfraKit` with a storage adapter.

```typescript
import { InfraKit } from "@infrakit-team/sdk";
import { KeyValueMemoryAdapter } from "@infrakit-team/module-kv-memory";

const infrakit = new InfraKit({
  keyValue: new KeyValueMemoryAdapter(),
});
```

### 2. Use the Client SDK

The client is available on the `infrakit.keyValue` property.

```typescript
// Set a simple key-value pair
infrakit.keyValue.set({
  key: "user:1",
  value: JSON.stringify({ name: "Alex" })
});

// Set a key with a 5-minute TTL
infrakit.keyValue.set({
  key: "cache:home",
  value: "<!DOCTYPE html>...",
  option: {
    timeToLiveInMs: 300000,
  },
});

// Get a value
const userJson = infrakit.keyValue.get({ key: "user:1" });

// Delete a key
infrakit.keyValue.del({ key: "user:1" });
```

### Creating a Custom Adapter

You can connect Infrakit to any storage backend (e.g., Redis, Postgres, filesystem) by creating a custom adapter. Your adapter must implement the `KeyValue` interface defined in `interface.ts`.

```typescript
import type { KeyValue } from "@infrakit-team/modules/kv";

export class MyCustomKvAdapter implements KeyValue {
  // Implement get, set, del methods...
  // Implement the dashboard-specific methods...
}
```
