// header.tsx — the utility bar (top-right convention): global ⌘K search trigger,
// a notifications menu, the theme toggle, and the user/workspace menu. On mobile
// it also carries the hamburger that opens the sidebar drawer. The search
// "field" is a button that opens the command palette (the palette IS the search)
// — so there's one search affordance, not two competing ones.
"use client";

import { Menu, Search, Bell, ChevronsUpDown, LogOut, UserRound, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "./sidebar-context";
import { usePalette } from "./command-palette";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const { setMobileOpen } = useSidebar();
  const { setOpen: setPaletteOpen } = usePalette();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg/80 px-3 backdrop-blur md:px-4">
      {/* mobile: open the nav drawer */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* global search → opens the ⌘K palette (a button, semantically) */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-border-strong bg-surface-raised px-3 text-sm text-fg-subtle outline-none transition-colors hover:border-brand/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Search projects, clients…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-fg-muted sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        {/* notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications, 3 unread"
            >
              <Bell className="size-5" />
              <span
                className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-bg"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="neutral">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm text-fg">
              <p className="font-medium">Billing portal hit 88%</p>
              <p className="text-xs text-fg-muted">Helios Energy · 2h ago</p>
            </div>
            <div className="px-2 py-1.5 text-sm text-fg">
              <p className="font-medium">Theo Park commented</p>
              <p className="text-xs text-fg-muted">Checkout funnel · 5h ago</p>
            </div>
            <div className="px-2 py-1.5 text-sm text-fg">
              <p className="font-medium">Mobile onboarding paused</p>
              <p className="text-xs text-fg-muted">Cadence Health · 1d ago</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        {/* user / workspace menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 pl-1.5 pr-2"
              aria-label="Account and workspace menu"
            >
              <Avatar className="size-7">
                <AvatarFallback>MV</AvatarFallback>
              </Avatar>
              <span className="hidden text-left text-sm leading-tight sm:block">
                <span className="block font-medium text-fg">Mara Velez</span>
                <span className="block text-xs text-fg-muted">Northwind Labs</span>
              </span>
              <ChevronsUpDown className="hidden size-4 text-fg-subtle sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Signed in as Mara</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Building2 className="size-4" />
              Switch workspace
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserRound className="size-4" />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
