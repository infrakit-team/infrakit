import { createAsync, query, useSearchParams } from "@solidjs/router";
import { Card, CardContent } from "../../component/ui/card";
import { Field, FieldLabel } from "../../component/ui/field";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "../../component/ui/sheet";
import { api } from "./api";

const getItem = query(
	(input: { key: string }) => api.view(input.key),
	"keyValueItem",
);

export function ViewKeyValueSheet() {
	const [searchParams, setSearchParams] = useSearchParams();
	const item = createAsync(() =>
		getItem({ key: searchParams.selectedKey as string }),
	);
	return (
		<Sheet
			open={Boolean(searchParams.selectedKey)}
			onOpenChange={(newOpen) => {
				if (newOpen === false) {
					setSearchParams({ selectedKey: undefined });
				}
			}}
		>
			<SheetContent>
				<SheetHeader>
					<SheetTitle class="text-left">Detail</SheetTitle>
					<SheetDescription></SheetDescription>
				</SheetHeader>
				<div class="flex flex-col gap-6">
					<Field>
						<FieldLabel>Key</FieldLabel>
						<Card>
							<CardContent class="bg-muted pt-4">
								<p class="wrap-anywhere text-left text-sm font-mono">
									{item()?.key}
								</p>
							</CardContent>
						</Card>
					</Field>
					<Field>
						<FieldLabel>Value</FieldLabel>
						<Card>
							<CardContent class="bg-muted pt-4">
								<p class="wrap-anywhere text-left text-sm font-mono">
									{item()?.value}
								</p>
							</CardContent>
						</Card>
					</Field>
				</div>
			</SheetContent>
		</Sheet>
	);
}
