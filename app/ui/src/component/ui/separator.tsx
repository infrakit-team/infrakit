import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { JSX, ValidComponent, VoidProps } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../cn";

type SeparatorProps<T extends ValidComponent = "div"> = VoidProps<
	{
		class?: string;
		orientation?: "horizontal" | "vertical";
		decorative?: boolean;
	} & JSX.HTMLAttributes<HTMLDivElement>
>;

export const Separator = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, SeparatorProps<T>>,
) => {
	const [local, rest] = splitProps(props as SeparatorProps, [
		"class",
		"orientation",
		"decorative",
	]);

	return (
		<div
			role={local.decorative ? "none" : "separator"}
			aria-orientation={local.orientation ?? "horizontal"}
			data-orientation={local.orientation ?? "horizontal"}
			class={cn(
				"bg-border shrink-0",
				local.orientation === "vertical" ? "h-full w-[1px]" : "h-[1px] w-full",
				local.class,
			)}
			{...rest}
		/>
	);
};
