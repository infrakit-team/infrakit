# Infrakit Hono Adapter (`@infrakit/adapter/hono`)

This package provides a dashboard adapter for Hono applications. It allows you to integrate the Infrakit dashboard into your Hono app using `app.route()`.

## Installation

```bash
bun add @infrakit/adapter/hono hono
```

## Usage

1.  Initialize the `HonoDashboardAdapter` with your `infrakit` instance and a `baseUrl`.
2.  Use `app.route()` to mount the adapter's `endpoint` at the specified base URL.

### Example

```typescript
import { HonoDashboardAdapter } from "@infrakit/adapter/hono";
import { KeyValueMemoryAdapter } from "@infrakit/modules/kv";
import { InfraKit } from "@infrakit/sdk";
import { Hono } from "hono";

// Initialize InfraKit
const infrakit = new InfraKit({
  keyValue:  new KeyValueMemoryAdapter(),
});

// Initialize the adapter
const dashboardAdapter = new HonoDashboardAdapter({
  infrakit,
  baseUrl: "/dashboard",
});

const app = new Hono();

// Mount the dashboard as a route
app.route("/dashboard", dashboardAdapter.endpoint);

app.get("/", (c) => c.text("Hello from Hono!"));

export default app;
```

The adapter automatically handles all routes under `/dashboard`, including serving the UI and proxying API requests to the Infrakit SDK.

