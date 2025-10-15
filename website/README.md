# Infrakit Website & Documentation

This directory contains the source code for the Infrakit documentation website, built with [Astro](https://astro.build/).

## Project Structure

-   `src/pages/`: Contains the main pages of the site.
-   `src/content/docs/`: Contains the Markdown and MDX files for the documentation content.
-   `src/layouts/`: Contains the Astro layouts used for different page types.
-   `src/components/`: Contains reusable Astro/UI components.
-   `public/`: Contains static assets like images and fonts.

## Commands

All commands are run from the root of the project, from a terminal:

| Command         | Action                                     |
| :-------------- | :----------------------------------------- |
| `bun install`   | Installs dependencies                      |
| `bun dev`       | Starts local dev server at `localhost:4321`|
| `bun build`     | Builds the production site to `./dist/`    |
| `bun preview`   | Previews your build locally                |

## Development

To start the local development server for the website:

```sh
bun --cwd ./website dev
```

The website will be available at `http://localhost:4321`.

