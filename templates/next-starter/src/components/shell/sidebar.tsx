// sidebar.tsx — the primary navigation. Object-oriented IA (nouns), >5 sections
// so it's a left sidebar (per the research decision tree). Two presentations of
// the SAME nav:
//   • desktop  — a persistent rail that toggles between full (labelled) and a
//     dense ICON RAIL. Collapsed is never icon-ONLY: each item keeps its label
//     in a Radix Tooltip (hover + focus), so meaning is preserved.
//   • mobile   — the same list inside a Radix Dialog drawer (focus-trapped),
//     opened by the header menu button.
// Active item via aria-current="page". Hit targets are ≥40px tall (clears 24px).
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { primaryNav, type NavItem } from "@/lib/nav";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/"
      className="flex h-9 items-center gap-2 rounded-md px-2 font-display text-lg font-semibold tracking-tight text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md bg-brand text-fg-on-brand"
        aria-hidden="true"
      >
        <Sparkles className="size-4" />
      </span>
      {!collapsed && <span>Atlas</span>}
    </Link>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        collapsed && "justify-center px-0",
        active
          ? "bg-brand-soft text-brand-strong"
          : "text-fg-muted hover:bg-muted hover:text-fg",
      )}
    >
      <item.icon className="size-5 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.title}</span>}
      {collapsed && <span className="sr-only">{item.title}</span>}
    </Link>
  );

  // collapsed rail keeps the label discoverable via tooltip (never icon-only)
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 px-3">
      {primaryNav.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isActive(pathname, item.href)}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

// ── Desktop rail ────────────────────────────────────────────────────────────
export function DesktopSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        // width animates between the two rail states (compositor-cheap width
        // tween; guarded by the global reduced-motion baseline)
        className={cn(
          "hidden shrink-0 border-r border-border bg-surface transition-[width] duration-200 md:flex md:flex-col",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-14 items-center px-3">
          <Brand collapsed={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavList collapsed={collapsed} />
        </div>
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "text-fg-muted",
              collapsed ? "mx-auto" : "w-full justify-start",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <>
                <PanelLeftClose className="size-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────
export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
      <DialogContent className="fixed inset-y-0 left-0 right-auto top-0 max-w-72 translate-x-0 translate-y-0 rounded-none rounded-r-lg border-y-0 border-l-0 p-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left-2 md:hidden">
        <VisuallyHidden>
          <DialogTitle>Navigation</DialogTitle>
          <DialogDescription>Primary app navigation menu.</DialogDescription>
        </VisuallyHidden>
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <Brand collapsed={false} />
        </div>
        <div className="py-3">
          <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
