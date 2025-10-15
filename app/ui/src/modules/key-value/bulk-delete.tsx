import { revalidate } from "@solidjs/router";
import type { Table as TanStackTable } from "@tanstack/solid-table";
import { Button } from "../../component/ui/button";
import { api } from "./api";
import type { KeyValueEntry } from "./use-table";

export function BulkDeleteButton({
	table,
}: {
	table: TanStackTable<KeyValueEntry>;
}) {
	return (
		<>
			{table.getSelectedRowModel().rows.length > 0 && (
				<Button
					onClick={() => {
						api
							.deleteBulk(
								table.getSelectedRowModel().rows.map((row) => row.original.key),
							)
							.then(() => {
								revalidate(["keyValueTableData", "keyValueStats"]);
							});
					}}
					variant="destructive"
					size="sm"
					class="whitespace-nowrap"
				>
					Delete {table.getSelectedRowModel().rows.length} rows
				</Button>
			)}
		</>
	);
}
