// table-states.tsx — the "design the boring states first" set for the Projects
// list. Each is a no-dead-end state: it tells you WHERE you are and WHAT to do.
//
//   • TableSkeleton — content-shaped loading (rows + a faint header), wrapped in
//     an aria-busy region with a polite "Loading projects…" status so the wait
//     isn't a silent gap for screen-reader users. No spinner flash for <300ms.
//   • EmptyState    — first-use empty: status + teach + a real primary CTA
//     (NN/g: empty states ARE the onboarding).
//   • ErrorState    — recoverable: plain language, a Retry that re-runs the
//     fetch, no raw stack trace.
import { FolderPlus, TriangleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="rounded-lg border border-border bg-surface-raised"
    >
      <span className="sr-only" role="status">
        Loading projects…
      </span>
      <div className="flex items-center gap-4 border-b border-border px-3 py-2.5">
        <Skeleton className="size-4 rounded-xs" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="ml-auto h-3 w-20" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-3 py-4 last:border-0"
        >
          <Skeleton className="size-4 rounded-xs" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="hidden h-3 w-16 sm:block" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <div
        className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand-strong"
        aria-hidden="true"
      >
        <FolderPlus className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-fg">
        No projects yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">
        Projects track a piece of client work — budget, owner, and progress.
        Create your first one to start tracking it here.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        <FolderPlus className="size-4" />
        Create project
      </Button>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger/5 px-6 py-16 text-center"
    >
      <div
        className="grid size-12 place-items-center rounded-full bg-danger/15 text-danger"
        aria-hidden="true"
      >
        <TriangleAlert className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-fg">
        Couldn’t load projects
      </h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">
        Something went wrong reaching the server. Your filters are still set —
        try again.
      </p>
      <Button variant="secondary" className="mt-5" onClick={onRetry}>
        <RotateCcw className="size-4" />
        Retry
      </Button>
    </div>
  );
}
