// coming-soon.tsx — a teaching empty state for the not-yet-built nav routes
// (Clients / Reports / Settings exist so the shell shows its full nav surface).
// Reuses the empty-state shape: status + teach + a way back, so it's not a
// dead end.
import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <div
        className="grid size-12 place-items-center rounded-full bg-muted text-fg-muted"
        aria-hidden="true"
      >
        <Construction className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-fg">
        {title} is on the roadmap
      </h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">
        This route is a placeholder so the app shell shows its full navigation.
        Wire it up the same way as Projects.
      </p>
      <Button variant="secondary" className="mt-5" asChild>
        <Link href="/projects">Go to Projects</Link>
      </Button>
    </div>
  );
}
