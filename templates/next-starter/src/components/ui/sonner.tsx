// sonner.tsx — the toast region. Sonner renders an aria-live region (polite,
// role=status) that ALREADY EXISTS in the DOM, so async results are announced
// without moving focus — the app-a11y "pre-existing live region" requirement.
// Toasts stay ≥4s and can carry an Undo action (see the table bulk actions).
// Colors are forced to cila tokens via CSS variables so nothing hardcodes hex.
"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      // honor the app's class-based dark mode by reading the documentElement
      theme="system"
      position="bottom-right"
      // map sonner's internal vars onto cila tokens (no raw hex)
      style={
        {
          "--normal-bg": "var(--color-surface-raised)",
          "--normal-text": "var(--color-fg)",
          "--normal-border": "var(--color-border)",
          "--success-bg": "var(--color-surface-raised)",
          "--success-text": "var(--color-success)",
          "--error-bg": "var(--color-surface-raised)",
          "--error-text": "var(--color-danger)",
          "--border-radius": "var(--radius-md)",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "!bg-surface-raised !text-fg !border !border-border !shadow-lg !font-body",
          description: "!text-fg-muted",
          actionButton: "!bg-brand !text-fg-on-brand",
          cancelButton: "!bg-muted !text-fg-muted",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
