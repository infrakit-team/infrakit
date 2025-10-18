# Example: Infrakit with Hono

This example demonstrates how to integrate the Infrakit dashboard into a Hono application.

## Overview

The entry point for this example is `main.ts`. It performs the following steps:

1.  Initializes an `InfraKit` instance with the `KeyValueMemoryAdapter`.
2.  Seeds the key-value store with sample data from `seed.ts`.
3.  Creates a `HonoDashboardAdapter`.
4.  Creates a Hono app and mounts the dashboard adapter using `app.route()` at the `/admin` path.
5.  Exports the Hono app for serving.

## How to Run

1.  **Install dependencies from the root directory:**
    ```sh
    bun install
    ```

2.  **Start the development server:**
    ```sh
    bun --cwd ./examples/hono dev
    ```

3.  **Access the application:**
    -   Your application will be running at `http://localhost:3000`.
    -   The Infrakit dashboard will be available at `http://localhost:3000/admin`.
