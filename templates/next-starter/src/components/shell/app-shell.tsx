// app-shell.tsx — the persistent chrome that wraps every route: Sidebar (primary
// nav) + Header (utility) + a fluid content area. Composed from the minimum
// slots (no right rail in this starter). Providers wrap the tree so the sidebar
// state, the ⌘K palette, and the toast region are available everywhere.
//
//   SidebarProvider  — desktop collapse + mobile drawer state
//   CommandPalette   — the single ⌘K dialog instance + its global shortcut
//   RouteAnnouncer   — moves focus to <main> + announces on client navigation
//   Toaster          — the always-present aria-live region for async feedback
"use client";

import * as React from "react";
import { SidebarProvider } from "./sidebar-context";
import { DesktopSidebar, MobileSidebar } from "./sidebar";
import { Header } from "./header";
import { CommandPalette } from "./command-palette";
import { RouteAnnouncer } from "./route-announcer";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <CommandPalette>
        {/* skip link — first tabbable element, jumps past the chrome */}
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-surface-raised focus-visible:px-4 focus-visible:py-2 focus-visible:text-fg focus-visible:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip to content
        </a>

        <div className="flex h-dvh overflow-hidden bg-bg">
          <DesktopSidebar />
          <MobileSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            {/* the fluid content area. tabIndex=-1 + the route-announcer let us
                move focus here on navigation without making it tabbable in
                normal flow. */}
            <main
              id="main"
              tabIndex={-1}
              className="flex-1 overflow-y-auto scroll-smooth outline-none"
            >
              <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>

        <RouteAnnouncer />
        <Toaster />
      </CommandPalette>
    </SidebarProvider>
  );
}
