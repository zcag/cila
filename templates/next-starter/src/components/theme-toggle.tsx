"use client";
// theme-toggle.tsx — a tiny client island. The no-flash script in layout.tsx
// sets the initial `.dark` class pre-paint; this reflects + flips it.
//
// We read the current scheme from the DOM via useSyncExternalStore so React
// stays in sync with the class the pre-paint script already applied — no
// setState-in-effect, and the server snapshot returns `false` to keep the
// initial markup deterministic (the button is symmetric, so no visual mismatch).
import { useSyncExternalStore, useCallback } from "react";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  // manual toggles below dispatch this so aria-pressed updates immediately
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
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color scheme"
      aria-pressed={isDark}
      className="grid size-9 place-items-center rounded-full border border-border text-fg-muted transition-colors hover:border-brand hover:text-brand"
    >
      <svg
        className="size-4 dark:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        className="hidden size-4 dark:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
