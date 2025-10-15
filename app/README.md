# App Directory

This directory contains all the core source code for the Infrakit project, organized into a set of internal packages.

## Structure

-   `./sdk`: The main developer-facing SDK (`@infrakit/sdk`) used to initialize and interact with Infrakit.
-   `./modules`: Contains the different infrastructure modules. Each module provides a specific piece of backend functionality.
    -   `kv`: A Key-Value store module.
-   `./adapter`: Contains framework-specific adapters that allow you to mount the Infrakit dashboard into an existing web application.
    -   `express`: An adapter for Express.js.
    -   `hono`: An adapter for Hono.
-   `./ui`: The frontend application for the dashboard, built with SolidJS and Vite. This package is consumed by the framework adapters.
