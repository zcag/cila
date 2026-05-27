// kpi-card.tsx — one dashboard KPI tile. F-pattern: the most important metric
// sits top-left of the grid (see the overview page order). Delta is shown with
// BOTH an arrow icon and a sign (never color-only), and the trend color maps to
// success/danger tokens. A server component — no interactivity needed.
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-muted">{label}</span>
        <Icon className="size-4 text-fg-subtle" aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg tabular-nums">
        {value}
      </p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-sm font-medium",
          trend === "up" ? "text-success" : "text-danger",
        )}
      >
        <TrendIcon className="size-4" aria-hidden="true" />
        {delta}
        <span className="font-normal text-fg-subtle">vs last month</span>
      </p>
    </Card>
  );
}
