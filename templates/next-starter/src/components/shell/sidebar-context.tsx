// sidebar-context.tsx — shared state for the app shell: desktop collapse (full
// labelled rail ⇄ icon rail) and mobile drawer open/closed. Persists the desktop
// choice to localStorage so the layout is stable across reloads. Kept tiny and
// dependency-free (no global store lib needed for this).
"use client";

import * as React from "react";

type SidebarState = {
  collapsed: boolean; // desktop: icon-rail when true
  toggleCollapsed: () => void;
  mobileOpen: boolean; // mobile drawer
  setMobileOpen: (v: boolean) => void;
};

const SidebarContext = React.createContext<SidebarState | null>(null);
const STORAGE_KEY = "cila:sidebar-collapsed";

// The persisted collapse flag is read via useSyncExternalStore (not a setState-
// in-effect) so it hydrates without a cascading render: the server snapshot is
// `false` (expanded), and the client reads localStorage. Writes notify the
// store via a custom event so all subscribers stay in sync.
const EVT = "cila:sidebar-change";
function subscribe(onChange: () => void) {
  window.addEventListener(EVT, onChange);
  return () => window.removeEventListener(EVT, onChange);
}
function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false, // server snapshot: expanded
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapsed = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, getSnapshot() ? "0" : "1");
    } catch {}
    window.dispatchEvent(new Event(EVT));
  }, []);

  const value = React.useMemo(
    () => ({ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }),
    [collapsed, toggleCollapsed, mobileOpen],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}
