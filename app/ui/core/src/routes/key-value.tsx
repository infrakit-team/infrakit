import { SearchIcon } from "lucide-solid";
import { Suspense } from "solid-js";
import { Page } from "../component/layout";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../component/ui/input-group";
import { AddEntryDialog } from "../modules/key-value/add-entry";
import { BulkDeleteButton } from "../modules/key-value/bulk-delete";
import { KeyValueListTable } from "../modules/key-value/list-table";
import { useKeyValueTable } from "../modules/key-value/use-table";
import { ViewKeyValueSheet } from "../modules/key-value/view-dialog";

export function KeyValueRoute() {
	const { table, actions, state } = useKeyValueTable();

	return (
		<Page>
			<div class="flex items-center justify-between mb-6 gap-2">
				<InputGroup>
					<InputGroupInput
						value={state.search}
						onInput={(e) => {
							actions.handleSearch(e.target.value);
						}}
						placeholder="Search..."
					/>
					<InputGroupAddon>
						<SearchIcon class="size-4" />
					</InputGroupAddon>
				</InputGroup>
				<BulkDeleteButton table={table} />
				<AddEntryDialog refetch={() => {}} />
			</div>
			<Suspense
				fallback={
					<div class="rounded-lg border border-border bg-card shadow p-8 text-center text-muted-foreground">
						Loading...
					</div>
				}
			>
				<KeyValueListTable table={table} />
			</Suspense>
			<ViewKeyValueSheet />
		</Page>
	);
}
