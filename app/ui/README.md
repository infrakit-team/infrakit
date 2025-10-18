# Infrakit UI

This directory contains the source code for the Infrakit dashboard frontend.

## Overview

The UI is a single-page application built with:

-   **Framework**: SolidJS
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS & Kobalte UI components

This package is not intended for direct use by end-users. Instead, it is built into static assets (`dist/`) which are then served automatically by the **framework adapters** (e.g., `@infrakit/adapter/express`).

## Development

You can run the UI in isolation for development purposes.

1.  **Start the dev server:**
    ```sh
    bun dev
    ```
    This will start the Vite development server on `http://localhost:5173`.

2.  **Proxying API Requests:**
    The Vite config is set up to proxy API requests under `/admin/api` to `http://localhost:3000`. To make this work, run one of the example backends (like `examples/express`) so it serves the dashboard at `/admin`.

## Build

To build the static assets for production, run:

```sh
bun build
```

This will generate the final CSS and JavaScript files in the `dist/` directory, which are then bundled with the framework adapters.
