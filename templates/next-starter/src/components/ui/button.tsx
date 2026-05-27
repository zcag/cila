// button.tsx — shadcn-on-Radix Button, re-skinned to cila's semantic tokens.
// Built on @radix-ui/react-slot so `asChild` can render the styles onto a Link
// or any element (correct semantics: a navigation is an <a>, not a <button>).
//
// All colors are tokens (bg-brand / text-fg / bg-muted / …) — no raw hex.
// Every size keeps a ≥24px (WCAG 2.5.8) hit target: the smallest variant is
// h-8 (32px) and icon buttons are size-9 (36px).
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // base: inline, centered, token focus ring, disabled affordance, no layout-thrash transitions
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-[color,background-color,border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand text-fg-on-brand shadow-sm hover:bg-brand-hover",
        secondary:
          "border border-border-strong bg-surface-raised text-fg shadow-sm hover:bg-muted",
        ghost: "text-fg hover:bg-muted",
        outline:
          "border border-border bg-transparent text-fg hover:bg-muted",
        destructive:
          "bg-danger text-fg-on-brand shadow-sm hover:opacity-90",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-sm px-3",
        lg: "h-11 rounded-md px-6",
        icon: "size-9", // 36px square — clears the 24px floor
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
