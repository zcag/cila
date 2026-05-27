// projects-table.tsx — the object-list-as-data-table, with its full state set.
//
// The 4 table tasks → the rules they imply (see RESEARCH §3):
//   • FIND    — human-readable first column (the project name), plus a debounced
//               search box (INP-aware: filtering waits 200ms after typing stops).
//   • COMPARE — sortable columns (click a header; aria-sort reflects direction),
//               right-aligned tabular numbers for budget, zebra-free hover rows.
//   • ACT     — a `⋯` overflow menu per row (Radix DropdownMenu: roving tabindex,
//               arrows, Esc), plus bulk-select checkboxes that pin a bulk-action
//               bar with an Undo-style flow (toast feedback, focus not moved).
//   • STATE   — a control switches between ideal / loading / empty / error so the
//               whole state matrix is demonstrable without a backend.
//
// Accessibility/perf notes:
//   • search debounced → no filtering on every keystroke (INP-friendly).
//   • bulk-select header box is tri-state (checked / indeterminate / unchecked).
//   • async feedback via the pre-existing Sonner live region (toast.success),
//     which announces without stealing focus.
"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Copy,
  Archive,
  Trash2,
  Search,
  X,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TableSkeleton, EmptyState, ErrorState } from "./table-states";
import {
  projects as seed,
  STATUS_LABEL,
  usdCompact,
  formatDate,
  type Project,
  type ProjectStatus,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const statusVariant: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  paused: "warning",
  archived: "neutral",
};

type SortKey = "name" | "client" | "status" | "progress" | "budget" | "updatedAt";
type SortDir = "asc" | "desc";

// The state-matrix demo switch. In a real app this is your fetch status.
export type DemoState = "ideal" | "loading" | "empty" | "error";

// debounce a value (search) so filtering runs off the typing hot path
function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export function ProjectsTable({ state }: { state: DemoState }) {
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounced(query, 200);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({
    key: "updatedAt",
    dir: "desc",
  });
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  const rows = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const filtered = q
      ? seed.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.client.toLowerCase().includes(q),
        )
      : seed;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [debouncedQuery, sort]);

  // tri-state header checkbox over the CURRENTLY VISIBLE rows
  const visibleIds = rows.map((r) => r.id);
  const selectedVisible = visibleIds.filter((id) => selected.has(id));
  const headerChecked: boolean | "indeterminate" =
    rows.length > 0 && selectedVisible.length === rows.length
      ? true
      : selectedVisible.length > 0
        ? "indeterminate"
        : false;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (selectedVisible.length === rows.length) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function bulkArchive() {
    const count = selected.size;
    clearSelection();
    // success via the live region; Undo > confirm (NN/g) — offered as the action
    toast.success(`${count} project${count > 1 ? "s" : ""} archived`, {
      action: { label: "Undo", onClick: () => toast("Restored") },
    });
  }

  // ── state-matrix branches ──────────────────────────────────────────────────
  if (state === "loading") return <TableSkeleton />;
  if (state === "empty")
    return (
      <EmptyState
        onCreate={() => {
          window.location.href = "/projects/new";
        }}
      />
    );
  if (state === "error")
    return (
      <ErrorState onRetry={() => toast("Retrying… (demo)")} />
    );

  return (
    <div className="space-y-3">
      {/* find: debounced search over the human-readable columns */}
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or client…"
          aria-label="Filter projects"
          className="pl-9"
        />
      </div>

      <div className="relative rounded-lg border border-border bg-surface-raised">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <span className="flex items-center pl-1">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={toggleAll}
                    aria-label="Select all visible projects"
                  />
                </span>
              </TableHead>
              <SortHeader label="Project" col="name" sort={sort} onSort={toggleSort} />
              <SortHeader label="Client" col="client" sort={sort} onSort={toggleSort} className="hidden md:table-cell" />
              <SortHeader label="Status" col="status" sort={sort} onSort={toggleSort} />
              <SortHeader label="Progress" col="progress" sort={sort} onSort={toggleSort} className="hidden lg:table-cell" />
              <SortHeader label="Budget" col="budget" sort={sort} onSort={toggleSort} align="right" className="hidden sm:table-cell" />
              <SortHeader label="Updated" col="updatedAt" sort={sort} onSort={toggleSort} className="hidden lg:table-cell" />
              <TableHead className="w-10">
                <span className="sr-only">Row actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-12 text-center text-sm text-fg-muted">
                  No projects match “{debouncedQuery}”.{" "}
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="font-medium text-brand underline-offset-4 hover:underline"
                  >
                    Clear filter
                  </button>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => (
                <ProjectRow
                  key={p.id}
                  project={p}
                  selected={selected.has(p.id)}
                  onToggle={() => toggleOne(p.id)}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* act: a pinned bulk-action bar appears when rows are selected */}
        {selected.size > 0 && (
          <div
            role="region"
            aria-label="Bulk actions"
            className="sticky bottom-4 mx-3 mb-3 flex items-center gap-3 rounded-md border border-border bg-surface-raised px-3 py-2 shadow-lg"
          >
            <span className="text-sm font-medium text-fg">
              {selected.size} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={bulkArchive}>
                <Archive className="size-4" />
                Archive
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-fg-muted"
              >
                <X className="size-4" />
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SortHeader({
  label,
  col,
  sort,
  onSort,
  align = "left",
  className,
}: {
  label: string;
  col: SortKey;
  sort: { key: SortKey; dir: SortDir };
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const activeSort = sort.key === col;
  const Icon = !activeSort ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead
      // aria-sort reflects the live sort to assistive tech
      aria-sort={activeSort ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={className}
    >
      <button
        type="button"
        onClick={() => onSort(col)}
        className={cn(
          "-mx-2 inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 font-semibold outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-ring",
          align === "right" && "flex-row-reverse",
          activeSort ? "text-fg" : "text-fg-muted",
        )}
      >
        {label}
        <Icon className="size-3.5 opacity-70" aria-hidden="true" />
      </button>
    </TableHead>
  );
}

function ProjectRow({
  project: p,
  selected,
  onToggle,
}: {
  project: Project;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell>
        <span className="flex items-center pl-1">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={`Select ${p.name}`}
          />
        </span>
      </TableCell>
      {/* human-readable first column — the row's primary identity + a link */}
      <TableCell>
        <Link
          href="/projects"
          className="font-medium text-fg outline-none hover:text-brand focus-visible:underline"
        >
          {p.name}
        </Link>
        <p className="text-xs text-fg-subtle md:hidden">{p.client}</p>
      </TableCell>
      <TableCell className="hidden text-fg-muted md:table-cell">{p.client}</TableCell>
      <TableCell>
        <Badge variant={statusVariant[p.status]}>{STATUS_LABEL[p.status]}</Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={p.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${p.name} progress`}
          >
            <div className="h-full rounded-full bg-brand" style={{ width: `${p.progress}%` }} />
          </div>
          <span className="text-xs tabular-nums text-fg-muted">{p.progress}%</span>
        </div>
      </TableCell>
      <TableCell className="hidden text-right font-medium tabular-nums sm:table-cell">
        {usdCompact.format(p.budget)}
      </TableCell>
      <TableCell className="hidden text-fg-muted lg:table-cell">
        <span className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">{p.owner.initials}</AvatarFallback>
          </Avatar>
          {formatDate(p.updatedAt)}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${p.name}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => toast(`Editing ${p.name}`)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast(`Duplicated ${p.name}`)}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast(`Archived ${p.name}`)}>
              <Archive className="size-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() =>
                toast.success(`Deleted ${p.name}`, {
                  action: { label: "Undo", onClick: () => toast("Restored") },
                })
              }
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
