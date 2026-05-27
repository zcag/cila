// skeleton.tsx — content-shaped loading placeholder (NN/g: perceived ~20–30%
// faster than a spinner for content-shaped waits). The pulse is opacity-only and
// is neutralized under prefers-reduced-motion via the global guard. The loading
// container should carry aria-busy + a visually-hidden "Loading…" status so the
// skeleton isn't a silent gap for screen-reader users.
import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
