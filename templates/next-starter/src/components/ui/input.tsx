// input.tsx — token-skinned text input. `aria-invalid` (set by the Form layer)
// flips the border + ring to the danger token, giving a non-color-only error
// cue alongside the inline message (the field also gets aria-describedby).
import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-border-strong bg-surface-raised px-3 py-1 text-sm text-fg shadow-sm outline-none transition-[color,box-shadow] placeholder:text-fg-subtle",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/40 aria-[invalid=true]:focus-visible:ring-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
