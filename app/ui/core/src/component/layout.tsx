import { A } from "@solidjs/router";
import { DatabaseIcon, HouseIcon, LayersIcon } from "lucide-solid";
import type { ParentProps } from "solid-js";
import { config } from "../shared/config";
import { cn } from "./cn";

export function DashboardLayout(props: ParentProps) {
	return (
		<div>
			<header class="px-6 py-4">
				<div class="flex items-center gap-2 mx-auto max-w-4xl">
					<div class="size-6 bg-foreground flex items-center justify-center rounded">
						<LayersIcon class="size-4 text-background" />
					</div>
					<p class="font-semibold">Infrakit</p>
				</div>
			</header>
			<nav class="px-6 border-border border-b">
				<div class="mx-auto max-w-4xl flex items-center gap-6">
					<A
						end
						href="/"
						activeClass="border-black"
						inactiveClass="border-transparent"
						class="py-2  flex items-center gap-2 w-fit border-b-2"
					>
						<HouseIcon class="size-4" />
						<span class="text-sm">Home</span>
					</A>
					<span
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<A
							activeClass="border-black"
							inactiveClass="border-transparent"
							class={cn(
								"py-2 flex items-center gap-2 w-fit border-b-2",
								!config.enabledModules.keyValue &&
									"pointer-events-none text-muted-foreground/50",
							)}
							aria-disabled={!config.enabledModules.keyValue}
							href="/key-value"
						>
							<DatabaseIcon class="size-4" />
							<span class="text-sm">Key value</span>
						</A>
					</span>
				</div>
			</nav>
			{props.children}
		</div>
	);
}

export function Page(props: ParentProps) {
	return (
		<div class="py-6 px-6">
			<div class="mx-auto max-w-4xl">{props.children}</div>
		</div>
	);
}
