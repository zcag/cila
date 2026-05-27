// page.tsx — the Overview route (app home). A small monitoring dashboard:
// ≤5 KPI cards in F-pattern order (most important top-left), then a compact
// "recent projects" list that drills into the Projects table. A server
// component — the dashboard is read-only monitoring, so no client JS here.
import Link from "next/link";
import {
  FolderKanban,
  CircleDollarSign,
  Activity,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  projects,
  STATUS_LABEL,
  usdCompact,
  formatDate,
  type ProjectStatus,
} from "@/lib/data";

const statusVariant: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  paused: "warning",
  archived: "neutral",
};

const kpis = [
  { label: "Active projects", value: "4", delta: "+1", trend: "up" as const, icon: FolderKanban },
  { label: "Pipeline value", value: "$402K", delta: "+12.4%", trend: "up" as const, icon: CircleDollarSign },
  { label: "Avg. completion", value: "58%", delta: "+6 pts", trend: "up" as const, icon: Activity },
  { label: "Overdue tasks", value: "7", delta: "-3", trend: "down" as const, icon: Clock },
];

export default function OverviewPage() {
  const recent = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title="Overview"
        description="A snapshot of your workspace. Drill into Projects for the full list."
        actions={
          <Button asChild>
            <Link href="/projects/new">New project</Link>
          </Button>
        }
      />

      {/* KPI row — F-pattern, ≤5 tiles, most important top-left */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </section>

      {/* recent activity → a drill-down into the table */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recently updated</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects" className="text-fg-muted">
              View all projects
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  href="/projects"
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{p.name}</p>
                    <p className="truncate text-sm text-fg-muted">{p.client}</p>
                  </div>
                  <Badge variant={statusVariant[p.status]}>
                    {STATUS_LABEL[p.status]}
                  </Badge>
                  <span className="hidden w-24 text-right text-sm tabular-nums text-fg-muted sm:block">
                    {usdCompact.format(p.budget)}
                  </span>
                  <span className="hidden w-24 text-right text-sm text-fg-subtle md:block">
                    {formatDate(p.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
