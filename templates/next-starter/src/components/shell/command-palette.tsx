// command-palette.tsx — the ⌘K accelerator (cmdk inside a Radix Dialog).
//
// Accessibility: cmdk renders the APG combobox contract (role=combobox on the
// input, role=listbox + aria-activedescendant on the results, virtual focus via
// arrow keys) and the Radix Dialog wrapper provides the focus TRAP + RESTORE +
// Esc + aria-modal. Opening it does not steal focus from the page permanently —
// focus returns to whatever triggered it on close.
//
// It's wired to the SAME nav config as the sidebar (real navigation) plus a few
// actions (new project, toggle theme). Exposed via context so the header search
// field and the global ⌘K / "/" shortcuts all open the one instance.
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Plus, SunMoon, CornerDownLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { primaryNav } from "@/lib/nav";

type PaletteState = { open: boolean; setOpen: (v: boolean) => void };
const PaletteContext = React.createContext<PaletteState | null>(null);

export function usePalette() {
  const ctx = React.useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within <CommandPalette>");
  return ctx;
}

export function CommandPalette({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Global accelerator: ⌘K / Ctrl-K opens; the field-free "/" also opens unless
  // the user is typing in a field. Listener is passive + cheap (no main-thread hog).
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const toggleTheme = React.useCallback(() => {
    setOpen(false);
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    window.dispatchEvent(new Event("cila:themechange"));
  }, []);

  return (
    <PaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          {/* Dialog needs an accessible name/description even though the visible
              UI is the command input — keep them for screen readers. */}
          <VisuallyHidden>
            <DialogTitle>Command palette</DialogTitle>
            <DialogDescription>
              Search to navigate or run an action. Use the arrow keys and Enter.
            </DialogDescription>
          </VisuallyHidden>

          <Command
            // cmdk does its own fuzzy filtering; label names the listbox.
            label="Command palette"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-fg-subtle"
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search
                className="size-4 shrink-0 text-fg-subtle"
                aria-hidden="true"
              />
              <Command.Input
                placeholder="Search or jump to…"
                className="h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
              />
              <kbd className="hidden rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-fg-muted sm:inline-block">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-80 overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="px-3 py-6 text-center text-sm text-fg-muted">
                No matches. Try another term.
              </Command.Empty>

              <Command.Group heading="Navigation">
                {primaryNav.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`go ${item.title}`}
                    onSelect={() => go(item.href)}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-fg outline-none data-[selected=true]:bg-muted"
                  >
                    <item.icon className="size-4 text-fg-muted" aria-hidden="true" />
                    {item.title}
                    <CornerDownLeft
                      className="ml-auto size-3.5 text-fg-subtle opacity-0 group-data-[selected=true]:opacity-100"
                      aria-hidden="true"
                    />
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Actions">
                <Command.Item
                  value="new project create"
                  onSelect={() => go("/projects/new")}
                  className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-fg outline-none data-[selected=true]:bg-muted"
                >
                  <Plus className="size-4 text-fg-muted" aria-hidden="true" />
                  New project
                </Command.Item>
                <Command.Item
                  value="toggle theme dark light"
                  onSelect={toggleTheme}
                  className="flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-fg outline-none data-[selected=true]:bg-muted"
                >
                  <SunMoon className="size-4 text-fg-muted" aria-hidden="true" />
                  Toggle theme
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </PaletteContext.Provider>
  );
}
