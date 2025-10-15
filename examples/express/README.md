# Example: Infrakit with Express

This example demonstrates how to integrate the Infrakit dashboard into a standard Express.js application.

## Overview

The entry point for this example is `main.ts`. It performs the following steps:

1.  Initializes an `InfraKit` instance with the `KeyValueMemoryAdapter`.
2.  Seeds the key-value store with sample data from `seed.ts`.
3.  Creates an `ExpressDashboardAdapter`.
4.  Creates an Express app and mounts the dashboard adapter at the `/dashboard` route.
5.  Starts the server on port 3000.

## How to Run

1.  **Install dependencies from the root directory:**
    ```sh
    bun install
    ```

2.  **Start the development server:**
    ```sh
    bun --cwd ./examples/express dev
    ```

3.  **Access the application:**
    -   Your application will be running at `http://localhost:3000`.
    -   The Infrakit dashboard will be available at `http://localhost:3000/dashboard`.

