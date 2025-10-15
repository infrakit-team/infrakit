import { A, createAsync, query } from "@solidjs/router";
import {
	CategoryScale,
	Chart,
	type ChartOptions,
	Filler,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
} from "chart.js";
import { Line } from "solid-chartjs";
import { createSignal, onMount, Show } from "solid-js";
import { Badge } from "../../component/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../component/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../component/ui/select";
import { config } from "../../shared/config";
import { api } from "./api";

const getStats = query(
	(timeRange: string) => api.stats(timeRange),
	"keyValueStats",
);

export function KeyValueAnalytics() {
	const [timeRange, setTimeRange] = createSignal("1h");
	const stats = createAsync(() => getStats(timeRange()));

	onMount(() => {
		Chart.register(
			LineController,
			CategoryScale,
			PointElement,
			LineElement,
			LinearScale,
			Filler,
		);
	});

	const chartData = () => {
		const data = stats();
		return {
			labels: data?.labels ?? [],
			datasets: [
				{
					data: data?.operationsHistory ?? [],
					borderColor: "hsl(var(--primary))",
					backgroundColor: "transparent",
					borderWidth: 2,
					tension: 0.4,
					pointRadius: 0,
					pointHoverRadius: 4,
					pointBackgroundColor: "hsl(var(--primary))",
					pointBorderColor: "hsl(var(--primary))",
				},
			],
		};
	};

	const chartOptions: ChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				enabled: true,
				mode: "index" as const,
				intersect: false,
			},
		},
		animation: false,
		scales: {
			x: {
				display: true,
				grid: {
					display: true,
					color: "oklch(0.97 0 0)",
					drawTicks: false,
				},
				ticks: {
					color: "oklch(0.556 0 0)",
					font: {
						size: 10,
					},
					maxRotation: 0,
					maxTicksLimit: 8,
				},
				border: {
					display: false,
				},
			},
			y: {
				display: true,
				grid: {
					display: true,
					color: "oklch(0.97 0 0)",
					drawTicks: false,
				},
				min: 0,
				ticks: {
					color: "oklch(0.556 0 0)",
					font: {
						size: 10,
					},
					callback: (value) => {
						if (Number(value) >= 1000) {
							return `${(Number(value) / 1000).toFixed(1)}k`;
						}
						return value.toString();
					},
				},
				border: {
					display: false,
				},
			},
		},
		interaction: {
			mode: "nearest" as const,
			axis: "x" as const,
			intersect: false,
		},
	};

	const getTimeRangeLabel = (range: string) => {
		const labels: Record<string, string> = {
			"1h": "1h ago",
			"6h": "6h ago",
			"24h": "24h ago",
			"7d": "7d ago",
		};
		return labels[range] || "1h ago";
	};

	return (
		<Show
			when={config.enabledModules.keyValue}
			fallback={
				<Card>
					<CardHeader>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<CardTitle class="flex items-center gap-2">
									Key Value Store
									<Badge variant="warning" class="font-normal">
										Disabled
									</Badge>
								</CardTitle>
							</div>
						</div>
					</CardHeader>
				</Card>
			}
		>
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<CardTitle class="flex items-center gap-2">
								Key Value Store
								<Badge variant="success" class="font-normal">
									Enabled
								</Badge>
							</CardTitle>
							<A
								href="/key-value"
								class="text-sm font-medium text-primary hover:underline"
							>
								View all →
							</A>
						</div>

						<Select
							value={timeRange()}
							onChange={setTimeRange}
							options={["1h", "6h", "24h", "7d"]}
							placeholder="Select time range"
							itemComponent={(props) => (
								<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
							)}
						>
							<SelectTrigger class="w-[100px] h-8 text-xs">
								<SelectValue<string>>
									{(state) => getTimeRangeLabel(state.selectedOption())}
								</SelectValue>
							</SelectTrigger>
							<SelectContent />
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-6">
						{/* Operations Line Chart */}
						<div class="space-y-3">
							<p class="text-sm font-medium">Operations</p>
							<div class="h-48 w-full">
								<Line data={chartData()} options={chartOptions} />
							</div>
						</div>

						{/* Stats Row */}
						<div class="flex gap-6">
							{/* Total Keys */}
							<div class="space-y-2 flex-1">
								<p class="text-sm text-muted-foreground">Total Keys</p>
								<p class="text-2xl font-bold tracking-tight">
									{stats()?.totalKeys?.toLocaleString() ?? "0"}
								</p>
								<div class="flex items-center gap-1 text-xs">
									<span
										class={
											(stats()?.totalKeysChange ?? 0) >= 0
												? "text-green-600 dark:text-green-400"
												: "text-red-600 dark:text-red-400"
										}
									>
										{(stats()?.totalKeysChange ?? 0) >= 0 ? "↑" : "↓"}{" "}
										{Math.abs(stats()?.totalKeysChange ?? 0).toFixed(1)}%
									</span>
									<span class="text-muted-foreground">
										vs last {timeRange()}
									</span>
								</div>
							</div>

							{/* Memory Usage */}
							<div class="space-y-2 flex-1">
								<p class="text-sm text-muted-foreground">Memory Usage</p>
								<p class="text-2xl font-bold tracking-tight">
									{stats()?.storageUsed ?? "0 MB"}
								</p>
							</div>

							{/* Cache Hit Rate */}
							<div class="space-y-2 flex-1">
								<p class="text-sm text-muted-foreground">Cache Hit Rate</p>
								<p class="text-2xl font-bold tracking-tight">
									{stats()?.hitRate?.toFixed(1) ?? "0"}%
								</p>
								<div class="flex items-center gap-1 text-xs">
									<span
										class={
											(stats()?.hitRateChange ?? 0) >= 0
												? "text-green-600 dark:text-green-400"
												: "text-red-600 dark:text-red-400"
										}
									>
										{(stats()?.hitRateChange ?? 0) >= 0 ? "↑" : "↓"}{" "}
										{Math.abs(stats()?.hitRateChange ?? 0).toFixed(1)}%
									</span>
									<span class="text-muted-foreground">
										vs last {timeRange()}
									</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Show>
	);
}
