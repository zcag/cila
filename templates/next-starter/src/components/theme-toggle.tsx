"use client";
// theme-toggle.tsx — a tiny client island. The no-flash script in layout.tsx
// sets the initial `.dark` class pre-paint; this reflects + flips it.
//
// We read the current scheme from the DOM via useSyncExternalStore so React
// stays in sync with the class the pre-paint script already applied — no
// setState-in-effect, and the server snapshot returns `false` to keep the
// initial markup deterministic (the button is symmetric, so no visual mismatch).
import { useSyncExternalStore, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  // manual toggles (here + the ⌘K palette) dispatch this so aria-pressed updates
  window.addEventListener("cila:themechange", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener("cila:themechange", onChange);
  };
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"), // client
    () => false, // server snapshot
  );

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("cila:themechange"));
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle color scheme"
      aria-pressed={isDark}
      className="text-fg-muted"
    >
      <Sun className="size-5 dark:hidden" />
      <Moon className="hidden size-5 dark:block" />
    </Button>
  );
}
