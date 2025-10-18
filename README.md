# Infrakit

**Infrakit is a lightweight, self-hostable toolkit for essential backend infrastructure, complete with a built-in admin dashboard for TypeScript applications.**

It provides a central SDK to integrate different modules, starting with a powerful in-memory Key-Value store. With adapters for popular web frameworks like Express and Hono, you can add powerful, observable infrastructure components to your existing application in minutes.

![Infrakit Dashboard](https://infrakit.dev/hero-image.png) <!--- Replace with an actual hero image URL -->

## Core Features

-   **Modular Architecture**: Easily add new capabilities like Key-Value stores, job queues (soon), and more.
-   **Built-in Dashboard**: A pre-built UI for at-a-glance observability and management of your modules.
-   **Framework Adapters**: Seamlessly integrate the dashboard into your existing Express or Hono application.
-   **Developer-First SDK**: A simple and intuitive TypeScript SDK to interact with your modules.
-   **In-Memory by Default**: Get started instantly with the built-in `KeyValueMemoryAdapter`, perfect for development and caching.

## Monorepo Structure

This project is a monorepo managed by `bun workspaces`. It's organized into the following main directories:

-   `📂 app/`: Contains all the core packages that make up Infrakit.
-   `sdk`: The main developer-facing SDK (`@infrakit-team/sdk`).
-   `modules`: Infrastructure modules, like `@infrakit-team/modules/kv` with adapters such as `@infrakit-team/module-kv-memory`.
-   `ui`: The SolidJS dashboard application and its framework adapters (`@infrakit-team/ui-hono`, `@infrakit-team/ui-express`).
-   `📂 examples/`: Example applications demonstrating how to use Infrakit with different frameworks.
-   `📂 website/`: The official documentation and marketing website, built with Astro.

## Getting Started

The fastest way to see Infrakit in action is to run one of the example applications.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/infrakit.git
    cd infrakit
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the Express example:**
    ```sh
    bun --cwd ./examples/express dev
    ```

Now, you can visit:
-   `http://localhost:3000` to see the example application running.
-   `http://localhost:3000/dashboard` to see the Infrakit dashboard.

## Releases

Use `bun run scripts/release/index.ts release <target>` to publish GitHub releases. The helper enforces `<target>-v<semver>` tag formats, checks for a clean, pushed branch, updates the relevant `package.json` files to the requested version, and generates notes with `git-cliff`. Set `RELEASE_DEBUG=true` to surface full stack traces when debugging failures.

### UI (`ui-v*`)

1. Ensure your working tree is clean, `main` (or the branch you want to release from) is up to date, and `gh auth status` succeeds.
2. Run the script with the new version number. The script accepts `0.1.3`, `v0.1.3`, or the full tag name:
    ```sh
    bun run scripts/release/index.ts release ui 0.1.3
    ```
3. Pass `--dry-run` (or `-d`) to preview commands without creating the release.

### SDK (`sdk-v*`)

Publish the SDK package with:

```sh
bun run scripts/release/index.ts release sdk 0.1.3
```

### KV Module (`kv-v*`)

Publish the KV core and memory adapter packages with:

```sh
bun run scripts/release/index.ts release modules kv 0.1.3
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

Infrakit is released under the MIT License. See the `LICENSE` file for details.

---

*This project is currently in early development. APIs and packages are subject to change.*
