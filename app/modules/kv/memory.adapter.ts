import type {
	KeyValue,
	KeyValueItem,
	KeyValueOption,
	KeyValueStats,
} from "./interface";

export class KeyValueMemoryAdapter implements KeyValue {
	private readonly map = new Map<string, KeyValueItem>();
	private operationsLog: Array<{ type: "read" | "write"; timestamp: number }> =
		[];
	private hitCount = 0;
	private missCount = 0;

	// Historical snapshots for calculating changes
	private snapshots: Array<{
		timestamp: number;
		totalKeys: number;
		hitRate: number;
	}> = [];
	private lastSnapshotTime = 0;
	private readonly SNAPSHOT_INTERVAL = 60 * 1000; // Take snapshot every 1 minute

	del(input: { key: string }): boolean {
		this.logOperation("write");
		return this.map.delete(input.key);
	}

	get(input: { key: string }): string | undefined {
		this.logOperation("read");
		const item = this.map.get(input.key);

		if (!item) {
			this.missCount++;
			return undefined;
		}

		// Check if expired
		if (
			item.meta.timeToLiveInMs &&
			Date.now() >
				new Date(item.meta.createdAtIso).getTime() + item.meta.timeToLiveInMs
		) {
			this.map.delete(input.key);
			this.missCount++;
			return undefined;
		}

		this.hitCount++;
		return item.value;
	}

	set(input: { key: string; value: string; option?: KeyValueOption }): boolean {
		try {
			this.logOperation("write");
			this.map.set(input.key, {
				value: input.value,
				meta: {
					createdAtIso: new Date().toISOString(),
					timeToLiveInMs: input.option?.timeToLiveInMs,
				},
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	private logOperation(type: "read" | "write") {
		const now = Date.now();
		this.operationsLog.push({ type, timestamp: now });

		// Keep only last 7 days of operations
		const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
		this.operationsLog = this.operationsLog.filter(
			(op) => op.timestamp > sevenDaysAgo,
		);
	}

	private calculateStorageSize(): number {
		let totalBytes = 0;
		for (const [key, item] of this.map.entries()) {
			// Rough estimation: key + value + metadata
			totalBytes += key.length * 2; // UTF-16
			totalBytes += item.value.length * 2;
			totalBytes += 100; // metadata overhead
		}
		return totalBytes;
	}

	private formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
	}

	private getOperationsInTimeRange(startTime: number, endTime: number) {
		return this.operationsLog.filter(
			(op) => op.timestamp >= startTime && op.timestamp <= endTime,
		);
	}

	/**
	 * Record a snapshot of current metrics if enough time has passed
	 */
	private maybeRecordSnapshot() {
		const now = Date.now();
		if (now - this.lastSnapshotTime >= this.SNAPSHOT_INTERVAL) {
			const totalAccess = this.hitCount + this.missCount;
			const hitRate = totalAccess > 0 ? (this.hitCount / totalAccess) * 100 : 0;

			this.snapshots.push({
				timestamp: now,
				totalKeys: this.map.size,
				hitRate,
			});

			this.lastSnapshotTime = now;

			// Keep only last 7 days of snapshots
			const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
			this.snapshots = this.snapshots.filter((s) => s.timestamp > sevenDaysAgo);
		}
	}

	/**
	 * Find the historical snapshot closest to the specified time in the past
	 */
	private findHistoricalSnapshot(timeRangeMs: number) {
		if (this.snapshots.length === 0) {
			return null;
		}

		const targetTime = Date.now() - timeRangeMs;

		// Find the snapshot closest to the target time
		let closest = this.snapshots[0];
		let minDiff = Math.abs(closest.timestamp - targetTime);

		for (const snapshot of this.snapshots) {
			const diff = Math.abs(snapshot.timestamp - targetTime);
			if (diff < minDiff) {
				minDiff = diff;
				closest = snapshot;
			}
		}

		return closest;
	}

	dashboard = {
		count: () => this.map.size,

		list: (input: {
			filter?: { key?: string };
			sort?: {
				key?: "asc" | "desc";
				value?: "asc" | "desc";
				created?: "asc" | "desc";
			};
			paginate: { pageSize: number; pageIndex: number };
		}) => {
			const { paginate, sort, filter } = input;
			let entries = Array.from(this.map.entries());

			if (filter?.key) {
				entries = entries.filter(([key]) => {
					return key.toLowerCase().includes(filter.key.toLowerCase());
				});
			}

			if (sort?.key) {
				entries = entries.sort(([aKey], [bKey]) => {
					if (sort.key === "asc") {
						return aKey < bKey ? -1 : 1;
					} else {
						return aKey < bKey ? 1 : -1;
					}
				});
			}

			if (sort?.value) {
				entries = entries.sort(([, aVal], [, bVal]) => {
					if (sort.value === "asc") {
						return aVal.value < bVal.value ? -1 : 1;
					} else {
						return aVal.value < bVal.value ? 1 : -1;
					}
				});
			}

			if (sort?.created) {
				entries = entries.sort(([, aVal], [, bVal]) => {
					if (sort.created === "asc") {
						return aVal.meta.createdAtIso < bVal.meta.createdAtIso ? -1 : 1;
					} else {
						return aVal.meta.createdAtIso < bVal.meta.createdAtIso ? 1 : -1;
					}
				});
			}

			const start = paginate.pageIndex * paginate.pageSize;
			const end = start + paginate.pageSize;

			return {
				data: entries
					.slice(start, end)
					.map(([key, item]) => ({ key, value: item.value, meta: item.meta })),
				count: entries.length,
			};
		},

		stats: (timeRange: string): KeyValueStats => {
			// Record a snapshot if needed
			this.maybeRecordSnapshot();

			const now = Date.now();
			const ranges = {
				"1h": { ms: 60 * 60 * 1000, dataPoints: 24 },
				"6h": { ms: 6 * 60 * 60 * 1000, dataPoints: 24 },
				"24h": { ms: 24 * 60 * 60 * 1000, dataPoints: 24 },
				"7d": { ms: 7 * 24 * 60 * 60 * 1000, dataPoints: 28 },
			};

			const range = ranges[timeRange as keyof typeof ranges] || ranges["1h"];
			const startTime = now - range.ms;
			const intervalMs = range.ms / range.dataPoints;

			// Calculate current hit rate
			const totalAccess = this.hitCount + this.missCount;
			const hitRate = totalAccess > 0 ? (this.hitCount / totalAccess) * 100 : 0;

			// Find historical snapshot for comparison
			const historicalSnapshot = this.findHistoricalSnapshot(range.ms);

			let totalKeysChange = 0;
			let hitRateChange = 0;

			if (historicalSnapshot) {
				// Calculate percentage change in total keys
				if (historicalSnapshot.totalKeys > 0) {
					totalKeysChange =
						((this.map.size - historicalSnapshot.totalKeys) /
							historicalSnapshot.totalKeys) *
						100;
				}

				// Calculate absolute change in hit rate (percentage points)
				hitRateChange = hitRate - historicalSnapshot.hitRate;
			}

			// Generate operations history and labels
			const operationsHistory: number[] = [];
			const labels: string[] = [];

			for (let i = 0; i < range.dataPoints; i++) {
				const intervalStart = startTime + i * intervalMs;
				const intervalEnd = intervalStart + intervalMs;
				const opsInInterval = this.getOperationsInTimeRange(
					intervalStart,
					intervalEnd,
				);
				operationsHistory.push(opsInInterval.length);

				// Generate label for this data point
				const date = new Date(intervalStart);

				if (timeRange === "7d") {
					labels.push(
						date.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						}),
					);
				} else if (timeRange === "24h") {
					labels.push(
						date.toLocaleTimeString("en-US", {
							hour: "numeric",
							hour12: true,
						}),
					);
				} else {
					labels.push(
						date.toLocaleTimeString("en-US", {
							hour: "numeric",
							minute: "2-digit",
							hour12: true,
						}),
					);
				}
			}

			// Calculate storage
			const storageBytes = this.calculateStorageSize();
			const storageUsed = this.formatBytes(storageBytes);

			return {
				totalKeys: this.map.size,
				storageUsed,
				hitRate,
				totalKeysChange,
				hitRateChange,
				operationsHistory,
				labels,
			};
		},

		view: (input: {
			key: string;
		}): (KeyValueItem & { key: string }) | undefined => {
			const item = this.map.get(input.key);
			if (!item) {
				return undefined;
			}
			return { key: input.key, ...item };
		},

		deleteBulk: (input: { keys: string[] }): boolean => {
			for (const key of input.keys) {
				this.map.delete(key);
			}
			return true;
		},
	};
}
