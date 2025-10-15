import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "../cn";

export const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring border-transparent whitespace-nowrap w-fit",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"bg-destructive text-destructive-foreground  hover:bg-destructive/80",
				outline: "text-foreground border-border",
				success:
					"bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20",
				warning:
					"bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20",
				info: "bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-500/20",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export const Badge = (
	props: ComponentProps<"div"> & VariantProps<typeof badgeVariants>,
) => {
	const [local, rest] = splitProps(props, ["class", "variant"]);
	return (
		<div
			class={cn(
				badgeVariants({
					variant: local.variant,
				}),
				local.class,
			)}
			{...rest}
		/>
	);
};
