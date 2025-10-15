import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";

export default defineConfig({
	integrations: [
		expressiveCode({
			styleOverrides: {
				frames: { frameBoxShadowCssValue: "none" },
				tooltipSuccessBackground: "var(--color-green-3)",
				tooltipSuccessForeground: "var(--color-green-12)",
			},
		}),
		mdx(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});

