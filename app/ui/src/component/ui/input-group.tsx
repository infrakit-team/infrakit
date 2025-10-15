import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { Component, JSX, ValidComponent, VoidProps } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../cn";
import { Button } from "./button";
import { Input, type InputProps } from "./input";
import { TextArea } from "./text-area";

type InputGroupProps<T extends ValidComponent = "div"> = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export const InputGroup = <T extends ValidComponent = "div">(
	props: PolymorphicProps<T, InputGroupProps<T>>,
) => {
	const [local, rest] = splitProps(props as InputGroupProps, [
		"class",
		"children",
	]);

	return (
		<div
			data-slot="input-group"
			role="group"
			class={cn(
				"group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
				"h-9 has-[>textarea]:h-auto",

				// Variants based on alignment
				"has-[>[data-align=inline-start]]:[&>input]:pl-2",
				"has-[>[data-align=inline-end]]:[&>input]:pr-2",
				"has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
				"has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

				// Focus state
				"has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",

				// Error state
				"has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

				local.class,
			)}
			{...rest}
		>
			{local.children}
		</div>
	);
};

const inputGroupAddonVariants = cva(
	"text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
	{
		variants: {
			align: {
				"inline-start":
					"order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
				"inline-end":
					"order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
				"block-start":
					"order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
				"block-end":
					"order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	},
);

type InputGroupAddonProps = {
	class?: string;
	children?: JSX.Element;
	onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>;
} & VariantProps<typeof inputGroupAddonVariants> &
	JSX.HTMLAttributes<HTMLDivElement>;

export const InputGroupAddon: Component<InputGroupAddonProps> = (props) => {
	const [local, rest] = splitProps(props, [
		"class",
		"align",
		"children",
		"onClick",
	]);

	const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
		if ((e.target as HTMLElement).closest("button")) {
			return;
		}
		const input = e.currentTarget.parentElement?.querySelector("input");
		input?.focus();

		local.onClick?.(e);
	};

	return (
		<div
			role="group"
			data-slot="input-group-addon"
			data-align={local.align ?? "inline-start"}
			class={cn(inputGroupAddonVariants({ align: local.align }), local.class)}
			onClick={handleClick}
			{...rest}
		>
			{local.children}
		</div>
	);
};

const inputGroupButtonVariants = cva(
	"text-sm shadow-none flex gap-2 items-center",
	{
		variants: {
			size: {
				xs: "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
				sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
				"icon-xs":
					"size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
				"icon-sm": "size-8 p-0 has-[>svg]:p-0",
			},
		},
		defaultVariants: {
			size: "xs",
		},
	},
);

type InputGroupButtonProps<T extends ValidComponent = "button"> = Omit<
	Parameters<typeof Button<T>>[0],
	"size"
> &
	VariantProps<typeof inputGroupButtonVariants> & {
		class?: string;
	};

export const InputGroupButton = <T extends ValidComponent = "button">(
	props: PolymorphicProps<T, InputGroupButtonProps<T>>,
) => {
	const [local, rest] = splitProps(props as InputGroupButtonProps, [
		"class",
		"size",
		"variant",
	]);

	return (
		<Button
			data-size={local.size ?? "xs"}
			variant={local.variant ?? "ghost"}
			class={cn(inputGroupButtonVariants({ size: local.size }), local.class)}
			{...rest}
		/>
	);
};

type InputGroupTextProps = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLSpanElement>;

export const InputGroupText: Component<InputGroupTextProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<span
			class={cn(
				"text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</span>
	);
};

type InputGroupInputProps<T extends ValidComponent = "input"> = VoidProps<
	InputProps<T>
>;

export const InputGroupInput = <T extends ValidComponent = "input">(
	props: PolymorphicProps<T, InputGroupInputProps<T>>,
) => {
	const [local, rest] = splitProps(props as InputGroupInputProps, ["class"]);

	return (
		<Input
			data-slot="input-group-control"
			class={cn(
				"flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
				local.class,
			)}
			{...rest}
		/>
	);
};

type InputGroupTextareaProps<T extends ValidComponent = "textarea"> = VoidProps<
	Parameters<typeof TextArea<T>>[0] & {
		class?: string;
	}
>;

export const InputGroupTextarea = <T extends ValidComponent = "textarea">(
	props: PolymorphicProps<T, InputGroupTextareaProps<T>>,
) => {
	const [local, rest] = splitProps(props as InputGroupTextareaProps, ["class"]);

	return (
		<TextArea
			data-slot="input-group-control"
			class={cn(
				"flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
				local.class,
			)}
			{...rest}
		/>
	);
};
