// textarea.tsx — multiline counterpart to Input, same token + aria-invalid wiring.
import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-border-strong bg-surface-raised px-3 py-2 text-sm text-fg shadow-sm outline-none transition-[color,box-shadow] placeholder:text-fg-subtle",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/40 aria-[invalid=true]:focus-visible:ring-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
