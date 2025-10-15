import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { Component, JSX, ResolvedChildren } from "solid-js";
import { createMemo, For, Show, splitProps } from "solid-js";
import { cn } from "../cn";
import { Label } from "./label";
import { Separator } from "./separator";

type FieldSetProps = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLFieldSetElement>;

export const FieldSet: Component<FieldSetProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<fieldset
			data-slot="field-set"
			class={cn(
				"flex flex-col gap-6",
				"has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</fieldset>
	);
};

type FieldLegendProps = {
	class?: string;
	children?: JSX.Element;
	variant?: "legend" | "label";
} & JSX.HTMLAttributes<HTMLLegendElement>;

export const FieldLegend: Component<FieldLegendProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "variant"]);

	return (
		<legend
			data-slot="field-legend"
			data-variant={local.variant ?? "legend"}
			class={cn(
				"mb-3 font-medium",
				"data-[variant=legend]:text-base",
				"data-[variant=label]:text-sm",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</legend>
	);
};

type FieldGroupProps = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export const FieldGroup: Component<FieldGroupProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<div
			data-slot="field-group"
			class={cn(
				"group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</div>
	);
};

const fieldVariants = cva(
	"group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
	{
		variants: {
			orientation: {
				vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
				horizontal: [
					"flex-row items-center",
					"[&>[data-slot=field-label]]:flex-auto",
					"has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
				],
				responsive: [
					"flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
					"@md/field-group:[&>[data-slot=field-label]]:flex-auto",
					"@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
				],
			},
		},
		defaultVariants: {
			orientation: "vertical",
		},
	},
);

type FieldProps = {
	class?: string;
	children?: JSX.Element;
} & VariantProps<typeof fieldVariants> &
	JSX.HTMLAttributes<HTMLDivElement>;

export const Field: Component<FieldProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "orientation"]);

	return (
		<div
			role="group"
			data-slot="field"
			data-orientation={local.orientation ?? "vertical"}
			class={cn(fieldVariants({ orientation: local.orientation }), local.class)}
			{...rest}
		>
			{local.children}
		</div>
	);
};

type FieldContentProps = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export const FieldContent: Component<FieldContentProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<div
			data-slot="field-content"
			class={cn(
				"group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</div>
	);
};

type FieldLabelProps = {
	class?: string;
	children: ResolvedChildren;
} & Parameters<typeof Label>[0];

export const FieldLabel: Component<FieldLabelProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<Label
			data-slot="field-label"
			class={cn(
				"group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
				"has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
				"has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</Label>
	);
};

type FieldTitleProps = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export const FieldTitle: Component<FieldTitleProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<div
			data-slot="field-label"
			class={cn(
				"flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</div>
	);
};

type FieldDescriptionProps = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLParagraphElement>;

export const FieldDescription: Component<FieldDescriptionProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<p
			data-slot="field-description"
			class={cn(
				"text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
				"last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
				"[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
				local.class,
			)}
			{...rest}
		>
			{local.children}
		</p>
	);
};

type FieldSeparatorProps = {
	class?: string;
	children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export const FieldSeparator: Component<FieldSeparatorProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children"]);

	return (
		<div
			data-slot="field-separator"
			data-content={!!local.children}
			class={cn(
				"relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
				local.class,
			)}
			{...rest}
		>
			<Separator class="absolute inset-0 top-1/2" />
			<Show when={local.children}>
				<span
					class="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
					data-slot="field-separator-content"
				>
					{local.children}
				</span>
			</Show>
		</div>
	);
};

type FieldErrorProps = {
	class?: string;
	children?: JSX.Element;
	errors?: Array<{ message?: string } | undefined>;
} & JSX.HTMLAttributes<HTMLDivElement>;

export const FieldError: Component<FieldErrorProps> = (props) => {
	const [local, rest] = splitProps(props, ["class", "children", "errors"]);

	const content = createMemo(() => {
		if (local.children) {
			return local.children;
		}

		if (!local.errors) {
			return null;
		}

		if (local.errors.length === 1 && local.errors[0]?.message) {
			return local.errors[0].message;
		}

		return (
			<ul class="ml-4 flex list-disc flex-col gap-1">
				<For each={local.errors}>
					{(error) => (
						<Show when={error?.message}>
							<li>{error!.message}</li>
						</Show>
					)}
				</For>
			</ul>
		);
	});

	return (
		<Show when={content()}>
			<div
				role="alert"
				data-slot="field-error"
				class={cn("text-destructive text-sm font-normal", local.class)}
				{...rest}
			>
				{content()}
			</div>
		</Show>
	);
};
