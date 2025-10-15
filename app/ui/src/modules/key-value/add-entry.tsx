import { PlusIcon } from "lucide-solid";
import { createSignal } from "solid-js";
import { Button } from "../../component/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../component/ui/dialog";
import { Field, FieldLabel } from "../../component/ui/field";
import { Input } from "../../component/ui/input";
import { api } from "./api";

export function AddEntryDialog(props: { refetch: () => void }) {
	const [open, setOpen] = createSignal(false);
	const [newKey, setNewKey] = createSignal("");
	const [newValue, setNewValue] = createSignal("");

	const handleAdd = async () => {
		const key = newKey();
		const value = newValue();
		if (!key || !value) return;

		await api.set(key, value);
		setNewKey("");
		setNewValue("");
		props.refetch();
		setOpen(false);
	};

	return (
		<Dialog open={open()} onOpenChange={setOpen}>
			<DialogTrigger class="whitespace-nowrap" size="sm" as={Button}>
				<PlusIcon class="size-4 mr-3" />
				Add Key
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Entry</DialogTitle>
				</DialogHeader>
				<Field>
					<FieldLabel>Key</FieldLabel>
					<Input
						value={newKey()}
						onInput={(e) => setNewKey(e.currentTarget.value)}
						placeholder="Key"
					/>
				</Field>
				<Field>
					<FieldLabel>Value</FieldLabel>
					<Input
						value={newValue()}
						onInput={(e) => setNewValue(e.currentTarget.value)}
						placeholder="Value"
					/>
				</Field>
				<DialogFooter>
					<Button onClick={() => setOpen(false)} variant="outline">
						Cancel
					</Button>
					<Button onClick={handleAdd}>Add</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
