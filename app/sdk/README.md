# Infrakit SDK (`@infrakit-team/sdk`)

The `@infrakit-team/sdk` package is the main entry point for using Infrakit in your application. It provides the `InfraKit` class that you use to configure and access your infrastructure modules and the associated dashboard.

## Installation

```bash
bun add @infrakit-team/sdk
```

You will also need to install the modules you intend to use, for example:
```bash
bun add @infrakit-team/modules/kv @infrakit-team/module-kv-memory
```

## Usage

Instantiate the `InfraKit` class with the modules you want to enable. Each module is configured with an `adapter` that provides its underlying implementation.

```typescript
import { InfraKit } from "@infrakit-team/sdk";
import { KeyValueMemoryAdapter } from "@infrakit-team/module-kv-memory";

// 1. Initialize InfraKit with your desired modules
const infrakit = new InfraKit({
  keyValue: new KeyValueMemoryAdapter(),
});

// 2. Use the client-side SDK in your application
const kv = infrakit.keyValue;

kv.set({ key: "user:1", value: "Alex" });
const user = kv.get({ key: "user:1" }); // "Alex"

// 3. Pass the `infrakit` instance to a dashboard adapter
// (See the documentation for @infrakit-team/ui-express or @infrakit-team/ui-hono)
```

## API Reference

### `new InfraKit(config)`

Creates a new Infrakit instance.

-   `config`: An object where you configure your modules.
    -   `keyValue`: (Optional)  An instance of a Key-Value adapter, like `KeyValueMemoryAdapter`.

### `infrakit.keyValue`

If the `keyValue` module is configured, this property provides access to the Key-Value client SDK for performing `get`, `set`, and `del` operations.

### `infrakit.dashboard`

This property provides access to the dashboard-specific functionality of the configured modules. You typically pass this object to a dashboard framework adapter.
