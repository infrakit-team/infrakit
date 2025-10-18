import { debounce } from "@solid-primitives/scheduled";
import { createAsync, query, useSearchParams } from "@solidjs/router";
import {
	type Column,
	type ColumnDef,
	createSolidTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
} from "@tanstack/solid-table";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	ChevronRightIcon,
	ChevronsUpDownIcon,
} from "lucide-solid";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { Badge } from "../../component/ui/badge";
import { Button } from "../../component/ui/button";
import { Checkbox, CheckboxControl } from "../../component/ui/checkbox";
import { api } from "./api";
import { formatDate } from "./util";

export type KeyValueEntry = {
	key: string;
	value: string;
	meta: {
		createdAtIso: string;
		timeToLiveInMs?: number;
	};
};

function highlightText(text: string, searchTerm: string) {
	if (!searchTerm) return [{ text, highlighted: false }];

	const regex = new RegExp(
		`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
		"gi",
	);
	const parts = text.split(regex);

	return parts.map((part) => ({
		text: part,
		highlighted: regex.test(part),
	}));
}

const columns: ColumnDef<KeyValueEntry>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				indeterminate={table.getIsSomePageRowsSelected()}
				checked={table.getIsAllPageRowsSelected()}
				onChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			>
				<CheckboxControl />
			</Checkbox>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			>
				<CheckboxControl />
			</Checkbox>
		),
		enableSorting: false,
		enableHiding: false,
		size: 20,
	},
	{
		accessorKey: "key",
		header: ({ column }) => (
			<DataTableSortableHeader title="Key" column={column} />
		),
		size: 300,
		cell: (info) => {
			const value = info.getValue() as string;
			const searchParams = useSearchParams()[0];
			const searchTerm = (searchParams.filterKey as string) || "";

			let displayValue = value;
			let showLeadingEllipsis = false;
			let showTrailingEllipsis = false;

			if (
				searchTerm &&
				value.toLowerCase().includes(searchTerm.toLowerCase())
			) {
				// Find the position of the search term
				const matchIndex = value
					.toLowerCase()
					.indexOf(searchTerm.toLowerCase());

				// Calculate start position (10 chars before match, or 0)
				const startIndex = Math.max(0, matchIndex - 10);
				showLeadingEllipsis = startIndex > 0;

				// Slice from start to end of string
				displayValue = value.slice(startIndex);
			} else {
				// If no match, show first 20 chars as before
				displayValue = value.slice(0, 20);
				showTrailingEllipsis = value.length > 20;
			}

			const parts = highlightText(displayValue, searchTerm);

			return (
				<span class="px-4 font-mono text-xs whitespace-nowrap">
					{showLeadingEllipsis && "..."}
					<For each={parts}>
						{(part) =>
							part.highlighted ? (
								<mark class="bg-yellow-300 dark:bg-yellow-600 font-semibold">
									{part.text}
								</mark>
							) : (
								<span>{part.text}</span>
							)
						}
					</For>
					{showTrailingEllipsis && "..."}
				</span>
			);
		},
	},
	{
		accessorKey: "value",
		header: ({ column }) => (
			<DataTableSortableHeader title="Value" column={column} />
		),
		size: 300,
		cell: (info) => {
			const value = info.getValue() as string;
			return (
				<span class="px-4 font-mono text-xs">
					{value.slice(0, 25)}
					{value.length > 25 && "..."}
				</span>
			);
		},
	},
	{
		accessorKey: "meta.createdAtIso",
		maxSize: 80,
		header: ({ column }) => (
			<DataTableSortableHeader title="Created" column={column} />
		),
		cell: (info) => (
			<span class="px-4 font-medium text-muted-foreground whitespace-nowrap text-xs">
				{formatDate(info.getValue() as string)}
			</span>
		),
	},
	{
		accessorKey: "meta.timeToLiveInMs",
		maxSize: 80,
		header: "TTL",
		cell: (info) => {
			const ttl = info.getValue() as number | undefined;

			const getBadgeState = (): { state: string; timeValue?: number } => {
				if (!ttl) return { state: "none" };

				const createdAt = new Date(
					info.row.original.meta.createdAtIso,
				).getTime();
				const expiresAt = createdAt + ttl;
				const now = Date.now();
				const remainingMs = expiresAt - now;

				if (remainingMs <= 0) {
					return { state: "expired" };
				}

				const remainingSeconds = Math.floor(remainingMs / 1000);
				const remainingMinutes = Math.floor(remainingSeconds / 60);

				if (remainingSeconds < 300) {
					return { state: "expiring", timeValue: remainingSeconds };
				}

				return { state: "active", timeValue: remainingMinutes };
			};

			const getTtlBadge = (state: string, timeValue?: number) => {
				switch (state) {
					case "active":
						return (
							<Badge variant="success">
								{timeValue ? `${timeValue}m` : "Active"}
							</Badge>
						);
					case "expiring":
						return (
							<Badge variant="warning">
								{timeValue ? `${timeValue}s` : "Expiring"}
							</Badge>
						);
					case "expired":
						return (
							<Badge variant="secondary" class="text-muted-foreground">
								Expired
							</Badge>
						);
					case "none":
						return <Badge variant="outline">No expiry</Badge>;
					default:
						return null;
				}
			};

			const { state, timeValue } = getBadgeState();
			return getTtlBadge(state, timeValue);
		},
	},
	{
		id: "view-key-value",
		header: "",
		cell: (info) => {
			const [_, setSearchParams] = useSearchParams();
			return (
				<div class="w-full flex flex-end">
					<Button
						onClick={() => {
							if (info.row.original.key) {
								setSearchParams({
									selectedKey: info.row.original.key as string,
								});
							}
						}}
						variant="ghost"
						size="icon"
						class="ml-auto"
					>
						<ChevronRightIcon class="size-4" />
					</Button>
				</div>
			);
		},
	},
];

const getTableData = query((input) => api.list(input), "keyValueTableData");

export function useKeyValueTable() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [debouncedFilter, setDebouncedFilter] = createSignal("");
	const [rowSelection, setRowSelection] = createSignal<RowSelectionState>({});

	const updateDebouncedFilter = debounce((key: string) => {
		setDebouncedFilter(key);
	}, 300);

	onMount(() => {
		setDebouncedFilter((searchParams.filterKey as string) || "");
	});

	createEffect(() => {
		updateDebouncedFilter((searchParams.filterKey as string) || "");
	});

	const tableData = createAsync(() =>
		getTableData({
			paginate: {
				pageIndex: Number(searchParams.pageIndex) || 0,
				pageSize: Number(searchParams.pageSize) || 10,
			},
			filter: { key: debouncedFilter() || undefined },
			sort: {
				key: searchParams.sortKey,
				value: searchParams.sortValue,
				created: searchParams.sortCreated,
			},
		}),
	);

	const table = createSolidTable({
		get data() {
			return tableData()?.data ?? [];
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		get rowCount() {
			return tableData()?.count ?? 0;
		},
		manualPagination: true,
		manualSorting: true,
		onPaginationChange: (updater) => {
			const current = {
				pageIndex: Number(searchParams.pageIndex) || 0,
				pageSize: Number(searchParams.pageSize) || 10,
			};
			const next = updater instanceof Function ? updater(current) : updater;
			setSearchParams({ pageSize: next.pageSize, pageIndex: next.pageIndex });
		},
		onSortingChange: (updater) => {
			const current = [];
			if (searchParams.sortCreated) {
				current.push({
					id: "meta.createdAtIso", // Keep the dot here
					desc: searchParams.sortCreated === "desc",
				});
			}
			if (searchParams.sortKey) {
				current.push({ id: "key", desc: searchParams.sortKey === "desc" });
			}
			if (searchParams.sortValue) {
				current.push({
					id: "value",
					desc: searchParams.sortValue === "desc",
				});
			}

			const next = updater instanceof Function ? updater(current) : updater;
			const toDesc = (sort: { desc: boolean }) => (sort.desc ? "desc" : "asc");

			setSearchParams({
				sortCreated: next.find((s) => s.id === "meta_createdAtIso")
					? toDesc(next.find((s) => s.id === "meta_createdAtIso")!)
					: undefined,
				sortKey: next.find((s) => s.id === "key")
					? toDesc(next.find((s) => s.id === "key")!)
					: undefined,
				sortValue: next.find((s) => s.id === "value")
					? toDesc(next.find((s) => s.id === "value")!)
					: undefined,
			});
		},
		onRowSelectionChange: setRowSelection,
		state: {
			get pagination() {
				return {
					pageIndex: Number(searchParams.pageIndex) || 0,
					pageSize: Number(searchParams.pageSize) || 10,
				};
			},
			get rowSelection() {
				return rowSelection();
			},
			get sorting() {
				const sort = [];
				if (searchParams.sortCreated) {
					sort.push({
						id: "meta_createdAtIso",
						desc: searchParams.sortCreated === "desc",
					});
				}
				if (searchParams.sortKey) {
					sort.push({ id: "key", desc: searchParams.sortKey === "desc" });
				}
				if (searchParams.sortValue) {
					sort.push({
						id: "value",
						desc: searchParams.sortValue === "desc",
					});
				}
				return sort;
			},
		},
	});

	return {
		table,
		actions: {
			handleSearch: (search: string) => setSearchParams({ filterKey: search }),
		},
		state: {
			search: searchParams.filterKey as string | undefined,
		},
	};
}

function DataTableSortableHeader<TData, TValue>({
	title,
	column,
}: {
	title: string;
	column: Column<TData, TValue>;
}) {
	return (
		<Button
			variant="ghost"
			class="h-8"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			<span class="mr-1">{title}</span>
			{column.getIsSorted() === "desc" ? (
				<ArrowDownIcon class="size-4" />
			) : column.getIsSorted() === "asc" ? (
				<ArrowUpIcon class="size-4" />
			) : (
				<ChevronsUpDownIcon class="size-4" />
			)}
		</Button>
	);
}
