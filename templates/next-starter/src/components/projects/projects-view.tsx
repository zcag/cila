// projects-view.tsx — wraps the table with a small "state matrix" switcher so
// the loading / empty / error / ideal states are all demonstrable in the
// starter without a backend. In a real app you'd delete this switch and drive
// `state` from your data-fetch status instead.
"use client";

import * as React from "react";
import { ProjectsTable, type DemoState } from "./projects-table";
import { cn } from "@/lib/utils";

const STATES: { value: DemoState; label: string }[] = [
  { value: "ideal", label: "Ideal" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

export function ProjectsView() {
  const [state, setState] = React.useState<DemoState>("ideal");

  return (
    <div className="space-y-4">
      {/* demo-only: flip between the table's states */}
      <div
        role="group"
        aria-label="Preview table state"
        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface p-1 text-sm"
      >
        <span className="px-2 text-xs font-medium text-fg-subtle">State</span>
        {STATES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setState(s.value)}
            aria-pressed={state === s.value}
            className={cn(
              "rounded-sm px-2.5 py-1 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              state === s.value
                ? "bg-brand text-fg-on-brand"
                : "text-fg-muted hover:bg-muted hover:text-fg",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ProjectsTable state={state} />
    </div>
  );
}
