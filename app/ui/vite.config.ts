import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	plugins: [solidPlugin(), tailwindcss()],
	server: {
		proxy: {
			"/dashboard/api": {
				// Match the actual path
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
});
