import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { ComponentProps, JSX, ValidComponent, VoidProps } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../cn";

type LabelProps<T extends ValidComponent = "label"> = VoidProps<
	{
		class?: string;
		children?: JSX.Element;
	} & JSX.LabelHTMLAttributes<HTMLLabelElement>
>;

export const Label = <T extends ValidComponent = "label">(
	props: PolymorphicProps<T, LabelProps<T>>,
) => {
	const [local, rest] = splitProps(props as LabelProps, ["class", "children"]);

	return (
		<label
			class={cn(
				"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</label>
	);
};
