Bun.serve({
	port: 3005,
	async fetch(req) {
		const url = new URL(req.url);
		const filePath = `.${url.pathname}`;

		const file = Bun.file(filePath);

		// Check if file exists
		if (await file.exists()) {
			// Determine content type
			let contentType = "application/octet-stream";
			if (filePath.endsWith(".js")) {
				contentType = "application/javascript";
			} else if (filePath.endsWith(".css")) {
				contentType = "text/css";
			} else if (filePath.endsWith(".html")) {
				contentType = "text/html";
			}

			return new Response(file, {
				headers: {
					"Content-Type": contentType,
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		return new Response("Not Found", {
			status: 404,
			headers: {
				"Access-Control-Allow-Origin": "*",
			},
		});
	},
});
console.log("Server running at http://localhost:3005");
