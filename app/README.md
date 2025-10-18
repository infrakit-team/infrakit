# App Directory

This directory contains all the core source code for the Infrakit project, organized into a set of internal packages.

## Structure

-   `./sdk`: The main developer-facing SDK (`@infrakit-team/sdk`) used to initialize and interact with Infrakit.
-   `./modules`: Contains the different infrastructure modules. Each module provides a specific piece of backend functionality.
    -   `kv`: The KV module (`@infrakit-team/modules/kv`) with supporting packages such as `@infrakit-team/module-kv-memory` and `@infrakit-team/modules/kv/test`.
-   `./ui`: The frontend dashboard (`@infrakit-team/ui`) and its framework adapters (`@infrakit-team/ui-hono`, `@infrakit-team/ui-express`), built with SolidJS and Vite.
