# Infrakit Hono Adapter (`@infrakit-team/ui-hono`)

This package provides a dashboard adapter for Hono applications. It allows you to integrate the Infrakit dashboard into your Hono app using `app.route()`.

## Installation

```bash
bun add @infrakit-team/ui-hono @infrakit-team/module-kv-memory @infrakit-team/sdk hono
```

## Usage

1.  Initialize the `HonoDashboardAdapter` with your `infrakit` instance and a `baseUrl`.
2.  Use `app.route()` to mount the adapter's `endpoint` at the specified base URL.

### Example

```typescript
import { HonoDashboardAdapter } from "@infrakit-team/ui-hono";
import { KeyValueMemoryAdapter } from "@infrakit-team/module-kv-memory";
import { InfraKit } from "@infrakit-team/sdk";
import { Hono } from "hono";

// Initialize InfraKit
const infrakit = new InfraKit({
  keyValue: new KeyValueMemoryAdapter(),
});

// Initialize the adapter
const dashboardAdapter = new HonoDashboardAdapter({
  infrakit,
  baseUrl: "/admin",
});

const app = new Hono();

// Mount the dashboard as a route
app.route("/admin", dashboardAdapter.endpoint);

app.get("/", (c) => c.text("Hello from Hono!"));

export default app;
```

The adapter automatically handles all routes under `/admin`, including serving the UI and proxying API requests to the Infrakit SDK.
