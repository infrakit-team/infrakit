// Helper function to format date as "8 Sep, 2025, 7:17 PM"
export function formatDate(isoString: string): string {
	const date = new Date(isoString);
	return date.toLocaleString("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}
