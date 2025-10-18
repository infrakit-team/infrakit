# Infrakit Express Adapter (`@infrakit-team/ui-express`)

This package provides a dashboard adapter for Express.js applications. It allows you to mount the entire Infrakit dashboard as a standard Express router.

## Installation

```bash
bun add @infrakit-team/ui-express @infrakit-team/module-kv-memory @infrakit-team/sdk express
```

## Usage

1.  Initialize the `ExpressDashboardAdapter` with your `infrakit` instance and a `baseUrl`.
2.  Use `app.use()` to mount the adapter's `endpoint` at the specified base URL.

### Example

```typescript
import { ExpressDashboardAdapter } from "@infrakit-team/ui-express";
import { KeyValueMemoryAdapter } from "@infrakit-team/module-kv-memory";
import { InfraKit } from "@infrakit-team/sdk";
import express from "express";

// Initialize InfraKit
const infrakit = new InfraKit({
  keyValue: new KeyValueMemoryAdapter(),
});

// Initialize the adapter
const dashboardAdapter = new ExpressDashboardAdapter({
  infrakit,
  baseUrl: "/dashboard",
});

const app = express();

// Mount the dashboard router
app.use("/dashboard", dashboardAdapter.endpoint);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Infrakit Dashboard available at http://localhost:3000/dashboard");
});
```

The adapter automatically handles all routes under `/dashboard`, including serving the UI and proxying API requests to the Infrakit SDK.
