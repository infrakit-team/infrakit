import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "solid-js";
import { cn } from "../cn";

export function Empty(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const { class: className, ...rest } = props;
	return (
		<div
			data-slot="empty"
			class={cn(
				"flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
				className,
			)}
			{...rest}
		/>
	);
}

export function EmptyHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const { class: className, ...rest } = props;
	return (
		<div
			data-slot="empty-header"
			class={cn(
				"flex max-w-sm flex-col items-center gap-2 text-center",
				className,
			)}
			{...rest}
		/>
	);
}

const emptyMediaVariants = cva(
	"flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export function EmptyMedia(
	props: JSX.HTMLAttributes<HTMLDivElement> &
		VariantProps<typeof emptyMediaVariants>,
) {
	const { class: className, variant = "default", ...rest } = props;
	return (
		<div
			data-slot="empty-icon"
			data-variant={variant}
			class={cn(emptyMediaVariants({ variant, className }))}
			{...rest}
		/>
	);
}

export function EmptyTitle(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const { class: className, ...rest } = props;
	return (
		<div
			data-slot="empty-title"
			class={cn("text-lg font-medium tracking-tight", className)}
			{...rest}
		/>
	);
}

export function EmptyDescription(
	props: JSX.HTMLAttributes<HTMLParagraphElement>,
) {
	const { class: className, ...rest } = props;
	return (
		<p
			data-slot="empty-description"
			class={cn(
				"text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
				className,
			)}
			{...rest}
		/>
	);
}

export function EmptyContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const { class: className, ...rest } = props;
	return (
		<div
			data-slot="empty-content"
			class={cn(
				"flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
				className,
			)}
			{...rest}
		/>
	);
}
