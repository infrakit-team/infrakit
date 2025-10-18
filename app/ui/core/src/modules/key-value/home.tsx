import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Badge } from "../../component/ui/badge";
import { Card, CardHeader, CardTitle } from "../../component/ui/card";
import { config } from "../../shared/config";

export function KeyValueAnalytics() {
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
						</div>
						<A
							href="/key-value"
							class="text-sm font-medium text-primary hover:underline"
						>
							View all →
						</A>
					</div>
				</CardHeader>
			</Card>
		</Show>
	);
}
