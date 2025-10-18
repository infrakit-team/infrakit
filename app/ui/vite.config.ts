import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	plugins: [solidPlugin(), tailwindcss()],
	server: {
		proxy: {
			"/admin/api": {
				// Match the actual path
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
	build: {
		assetsDir: ".",
		cssCodeSplit: false,
		rollupOptions: {
			output: {
				entryFileNames: "index.js",
				chunkFileNames: "[name].js",
				assetFileNames: (assetInfo) => {
					if (assetInfo.name?.endsWith(".css")) {
						return "index.css";
					}
					return "[name][extname]";
				},
				inlineDynamicImports: true,
			},
		},
	},
});
