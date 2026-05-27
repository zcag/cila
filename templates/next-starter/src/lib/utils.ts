// utils.ts — the one shared helper every shadcn-on-Radix component leans on.
// `cn()` merges conditional class lists (clsx) and dedupes conflicting Tailwind
// utilities (tailwind-merge), so a component's base classes and a caller's
// overrides resolve predictably (the last `bg-*` / `p-*` wins).
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
