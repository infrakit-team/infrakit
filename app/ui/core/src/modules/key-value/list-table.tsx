import { useSearchParams } from "@solidjs/router";
import type { Row, Table as TanStackTable } from "@tanstack/solid-table";
import { flexRender } from "@tanstack/solid-table";
import { DatabaseIcon } from "lucide-solid";
import { For, Show } from "solid-js";
import { Button } from "../../component/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../../component/ui/empty";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../component/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../component/ui/table";
import type { KeyValueEntry } from "./use-table";

export function KeyValueListTable(props: {
	table: TanStackTable<KeyValueEntry>;
}) {
	return (
		<div class="flex flex-col gap-4">
			<Show
				when={props.table.getRowModel().rows.length > 0}
				fallback={
					<Empty class="p-8 border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<DatabaseIcon />
							</EmptyMedia>
							<EmptyTitle>No key-value entries</EmptyTitle>
							<EmptyDescription>
								Add your first key-value pair to get started.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				}
			>
				<div class="rounded-lg border border-border bg-card shadow">
					<DataTable table={props.table} />
				</div>
				<DataTablePagination table={props.table} />
			</Show>
		</div>
	);
}

function DataTable<TValue>(props: {
	table: TanStackTable<TValue>;
	onRowClick?: (row: Row<TValue>) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<For each={props.table.getHeaderGroups()}>
					{(headerGroup) => (
						<TableRow>
							<For each={headerGroup.headers}>
								{(header) => (
									<TableHead
										style={{
											width: `${header.column.getSize()}px`,
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								)}
							</For>
						</TableRow>
					)}
				</For>
			</TableHeader>
			<TableBody>
				<For each={props.table.getRowModel().rows}>
					{(row) => (
						<TableRow onClick={() => props?.onRowClick?.(row)}>
							<For each={row.getVisibleCells()}>
								{(cell) => (
									<TableCell>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								)}
							</For>
						</TableRow>
					)}
				</For>
			</TableBody>
		</Table>
	);
}

function DataTablePagination({
	table,
}: {
	table: TanStackTable<KeyValueEntry>;
}) {
	return (
		<div class="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto px-2 py-1 sm:flex-row">
			<div class="flex-1 whitespace-nowrap text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length} of{" "}
				{table.getFilteredRowModel().rows.length} row(s) selected.
			</div>
			<div class="flex flex-col-reverse items-center gap-4 sm:flex-row">
				<div class="flex items-center space-x-2">
					<p class="whitespace-nowrap text-sm font-medium">Rows per page</p>
					<Select
						value={table.getState().pagination.pageSize}
						onChange={(value) => value && table.setPageSize(value)}
						options={[10, 20, 30, 40, 50]}
						itemComponent={(props) => (
							<SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
						)}
					>
						<SelectTrigger class="h-8 w-[4.5rem]">
							<SelectValue<string>>
								{(state) => state.selectedOption()}
							</SelectValue>
						</SelectTrigger>
						<SelectContent />
					</Select>
				</div>
				<div class="flex items-center justify-center whitespace-nowrap text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
				</div>
				<div class="flex items-center space-x-2">
					<Button
						aria-label="Go to first page"
						variant="outline"
						class="flex size-8 p-0"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<svg class="size-4" aria-hidden="true" viewBox="0 0 24 24">
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m11 7l-5 5l5 5m6-10l-5 5l5 5"
							/>
						</svg>
					</Button>
					<Button
						aria-label="Go to previous page"
						variant="outline"
						size="icon"
						class="size-8"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<svg class="size-4" aria-hidden="true" viewBox="0 0 24 24">
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m15 6l-6 6l6 6"
							/>
						</svg>
					</Button>
					<Button
						aria-label="Go to next page"
						variant="outline"
						size="icon"
						class="size-8"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<svg class="size-4" aria-hidden="true" viewBox="0 0 24 24">
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m9 6l6 6l-6 6"
							/>
						</svg>
					</Button>
					<Button
						aria-label="Go to last page"
						variant="outline"
						size="icon"
						class="flex size-8"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<svg class="size-4" aria-hidden="true" viewBox="0 0 24 24">
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m7 7l5 5l-5 5m6-10l5 5l-5 5"
							/>
						</svg>
					</Button>
				</div>
			</div>
		</div>
	);
}
