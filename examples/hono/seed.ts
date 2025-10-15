// Helper functions for random data generation
const randomItem = <T>(arr: T[]): T =>
	arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

// Data generators
const firstNames = [
	"Alice",
	"Bob",
	"Charlie",
	"Diana",
	"Eve",
	"Frank",
	"Grace",
	"Henry",
	"Iris",
	"Jack",
	"Karen",
	"Leo",
	"Mia",
	"Noah",
	"Olivia",
	"Paul",
	"Quinn",
	"Rachel",
	"Sam",
	"Tina",
];
const lastNames = [
	"Smith",
	"Johnson",
	"Williams",
	"Brown",
	"Jones",
	"Garcia",
	"Miller",
	"Davis",
	"Rodriguez",
	"Martinez",
	"Hernandez",
	"Lopez",
	"Gonzalez",
	"Wilson",
	"Anderson",
	"Thomas",
	"Taylor",
	"Moore",
	"Jackson",
	"Martin",
];
const cities = [
	"Sydney",
	"Melbourne",
	"Brisbane",
	"Perth",
	"Adelaide",
	"Canberra",
	"Hobart",
	"Darwin",
	"New York",
	"London",
	"Tokyo",
	"Paris",
	"Berlin",
	"Toronto",
	"Singapore",
	"Dubai",
	"Mumbai",
	"São Paulo",
];
const products = [
	"Widget",
	"Gadget",
	"Gizmo",
	"Device",
	"Tool",
	"Instrument",
	"Machine",
	"Appliance",
	"Equipment",
	"Apparatus",
];
const services = [
	"Premium",
	"Basic",
	"Enterprise",
	"Starter",
	"Professional",
	"Business",
	"Personal",
	"Team",
	"Ultimate",
];
const domains = [
	"example.com",
	"test.org",
	"demo.net",
	"sample.io",
	"acme.com",
	"corp.biz",
	"app.dev",
];

// TTL presets (in milliseconds)
const ttlPresets = [
	undefined, // No expiry
	5000, // 5 seconds
	10000, // 10 seconds
	30000, // 30 seconds
	60000, // 1 minute
	120000, // 2 minutes
	300000, // 5 minutes
	600000, // 10 minutes
	900000, // 15 minutes
	1800000, // 30 minutes
	3600000, // 1 hour
	7200000, // 2 hours
	14400000, // 4 hours
	43200000, // 12 hours
	86400000, // 24 hours
	172800000, // 2 days
	604800000, // 7 days
	2592000000, // 30 days
];

const data: Array<{ key: string; value: string; ttl?: number }> = [];

// 1. User Sessions (2000 entries)
for (let i = 0; i < 2000; i++) {
	const userId = 10000 + i;
	const firstName = randomItem(firstNames);
	const lastName = randomItem(lastNames);
	const sessionData = {
		userId,
		name: `${firstName} ${lastName}`,
		email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomItem(domains)}`,
		loggedIn: new Date(Date.now() - randomInt(0, 3600000)).toISOString(),
	};
	data.push({
		key: `session:user:${userId}`,
		value: JSON.stringify(sessionData),
		ttl: randomItem([3600000, 7200000, 14400000]), // 1-4 hours
	});
}

// 2. Cache Entries (1500 entries)
const cacheTypes = ["page", "api", "query", "fragment", "asset"];
for (let i = 0; i < 1500; i++) {
	const type = randomItem(cacheTypes);
	const id = randomInt(1, 10000);
	data.push({
		key: `cache:${type}:${id}`,
		value: JSON.stringify({
			data: `Cached content for ${type} ${id}`,
			timestamp: Date.now(),
			hits: randomInt(1, 1000),
		}),
		ttl: randomItem([300000, 600000, 900000, 1800000]), // 5-30 min
	});
}

// 3. Rate Limiting (1000 entries)
for (let i = 0; i < 1000; i++) {
	const ip = `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`;
	const endpoint = randomItem([
		"api",
		"login",
		"register",
		"upload",
		"download",
	]);
	data.push({
		key: `ratelimit:${endpoint}:${ip}`,
		value: String(randomInt(1, 100)),
		ttl: randomItem([60000, 120000, 300000]), // 1-5 min
	});
}

// 4. Product Catalog (800 entries)
for (let i = 0; i < 800; i++) {
	const product = {
		id: i,
		name: `${randomItem(products)} ${randomItem(["Pro", "Plus", "Lite", "Max", "Mini", "Ultra"])}`,
		price: randomInt(10, 1000),
		stock: randomInt(0, 500),
		category: randomItem([
			"Electronics",
			"Home",
			"Garden",
			"Sports",
			"Books",
			"Toys",
		]),
	};
	data.push({
		key: `product:${i}`,
		value: JSON.stringify(product),
		ttl: randomItem([3600000, 86400000, undefined]), // 1 hour, 1 day, or permanent
	});
}

// 5. Analytics Data (1200 entries)
for (let i = 0; i < 1200; i++) {
	const date = new Date(Date.now() - randomInt(0, 30) * 86400000);
	const dateStr = date.toISOString().split("T")[0];
	const metric = randomItem([
		"pageviews",
		"users",
		"sessions",
		"bounce",
		"conversion",
	]);
	data.push({
		key: `analytics:${metric}:${dateStr}:${randomInt(0, 23)}`,
		value: JSON.stringify({
			value: randomInt(100, 10000),
			timestamp: date.toISOString(),
		}),
		ttl: 86400000, // 24 hours
	});
}

// 6. API Tokens (500 entries)
for (let i = 0; i < 500; i++) {
	const tokenType = randomItem([
		"access",
		"refresh",
		"reset",
		"verify",
		"invite",
	]);
	const token =
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15);
	data.push({
		key: `token:${tokenType}:${token}`,
		value: JSON.stringify({
			userId: randomInt(10000, 12000),
			createdAt: new Date().toISOString(),
			scope: randomItem(["read", "write", "admin", "user"]),
		}),
		ttl: randomItem([900000, 1800000, 3600000, 86400000]), // 15 min to 24 hours
	});
}

// 7. Job Queue (600 entries)
for (let i = 0; i < 600; i++) {
	const jobType = randomItem([
		"email",
		"notification",
		"report",
		"backup",
		"sync",
		"process",
	]);
	data.push({
		key: `queue:${jobType}:job:${i}`,
		value: JSON.stringify({
			id: i,
			type: jobType,
			status: randomItem(["pending", "processing", "completed", "failed"]),
			priority: randomInt(1, 5),
			attempts: randomInt(0, 3),
		}),
		ttl: randomItem([600000, 1800000, 3600000]), // 10-60 min
	});
}

// 8. Feature Flags (200 entries)
const features = [
	"dark-mode",
	"beta-ui",
	"new-checkout",
	"ai-assistant",
	"advanced-search",
	"video-chat",
	"auto-save",
	"cloud-sync",
];
for (let i = 0; i < 200; i++) {
	const feature = randomItem(features);
	const variant = randomItem([
		"enabled",
		"disabled",
		"a",
		"b",
		"control",
		"test",
	]);
	data.push({
		key: `feature:${feature}:${variant}:${randomInt(1, 100)}`,
		value: String(Math.random() > 0.5),
		ttl: undefined, // No expiry for feature flags
	});
}

// 9. Distributed Locks (300 entries)
for (let i = 0; i < 300; i++) {
	const resource = randomItem([
		"db-migration",
		"file-upload",
		"batch-job",
		"cache-rebuild",
		"index-update",
	]);
	const workerId = `worker-${randomInt(1, 10)}`;
	data.push({
		key: `lock:${resource}:${i}`,
		value: workerId,
		ttl: randomItem([30000, 60000, 120000, 300000]), // 30 sec to 5 min
	});
}

// 10. User Preferences (700 entries)
for (let i = 0; i < 700; i++) {
	const userId = randomInt(10000, 12000);
	const setting = randomItem([
		"theme",
		"language",
		"timezone",
		"notifications",
		"privacy",
		"layout",
	]);
	const values: Record<string, string[]> = {
		theme: ["light", "dark", "auto"],
		language: ["en", "es", "fr", "de", "ja", "zh"],
		timezone: ["UTC", "EST", "PST", "GMT", "AEST"],
		notifications: ["all", "important", "none"],
		privacy: ["public", "friends", "private"],
		layout: ["grid", "list", "compact"],
	};
	data.push({
		key: `preference:user:${userId}:${setting}`,
		value: randomItem(values[setting]),
		ttl: randomItem([604800000, 2592000000, undefined]), // 7 days, 30 days, or permanent
	});
}

// 11. Weather Data (400 entries)
for (let i = 0; i < 400; i++) {
	const city = randomItem(cities);
	data.push({
		key: `weather:${city}:current`,
		value: JSON.stringify({
			temp: randomInt(5, 35),
			condition: randomItem(["sunny", "cloudy", "rainy", "stormy", "snowy"]),
			humidity: randomInt(30, 90),
			windSpeed: randomInt(0, 50),
		}),
		ttl: randomItem([600000, 1800000]), // 10-30 min
	});
}

// 12. Shopping Carts (500 entries)
for (let i = 0; i < 500; i++) {
	const cartId = `cart-${Math.random().toString(36).substring(2, 12)}`;
	const items = Array.from({ length: randomInt(1, 10) }, (_, j) => ({
		productId: randomInt(1, 800),
		quantity: randomInt(1, 5),
		price: randomInt(10, 500),
	}));
	data.push({
		key: `cart:${cartId}`,
		value: JSON.stringify({
			items,
			total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
			createdAt: new Date().toISOString(),
		}),
		ttl: 3600000, // 1 hour
	});
}

// 13. Metrics & Counters (300 entries)
for (let i = 0; i < 300; i++) {
	const metric = randomItem([
		"api-calls",
		"errors",
		"logins",
		"signups",
		"purchases",
		"downloads",
	]);
	const period = randomItem(["minute", "hour", "day"]);
	data.push({
		key: `counter:${metric}:${period}:${Date.now() - randomInt(0, 86400000)}`,
		value: String(randomInt(1, 10000)),
		ttl: randomItem([3600000, 86400000]), // 1-24 hours
	});
}

// 14. Search Queries (300 entries)
for (let i = 0; i < 300; i++) {
	const query = randomItem([
		"laptop deals",
		"best phone",
		"summer sale",
		"gift ideas",
		"tech news",
		"how to cook",
		"weather today",
		"movie reviews",
		"travel tips",
		"fitness plans",
	]);
	const hash = Math.random().toString(36).substring(2, 10);
	data.push({
		key: `search:query:${hash}`,
		value: JSON.stringify({
			query,
			results: randomInt(10, 1000),
			timestamp: new Date().toISOString(),
		}),
		ttl: randomItem([300000, 600000]), // 5-10 min
	});
}

export function getData() {
	return data;
}
