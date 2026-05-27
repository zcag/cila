---
name: design-tokens
description: Author an OKLCH design-token system for Tailwind v4 (@theme) derived from a single --brand-hue, with light/dark, a 4px spacing grid, a modular type scale, and radius/motion tokens. Use when creating or editing tokens.css / a design system for a cila project, or when a component hardcodes values that should be tokens.
---

# Design Tokens — OKLCH, Tailwind v4

`tokens.css` is the **single source of truth**. Three tiers:

1. **Primitive** — raw values (`--blue-500`, `--space-4`).
2. **Semantic** — purpose (`--color-bg`, `--color-fg`, `--color-brand`, `--color-accent`, `--color-muted`, `--color-border`). **Components reference these, never raw values or hex.**
3. **Component** — variant-level overrides where a component genuinely differs.

## The one-knob system
Derive the whole palette from `--brand-hue` so a single number re-themes everything. OKLCH gives perceptually-even steps (no muddy mid-tones).

```css
:root {
  --brand-hue: 265;                                   /* the one knob */

  /* semantic, light */
  --bg:      oklch(0.99 0.005 var(--brand-hue));
  --fg:      oklch(0.20 0.02  var(--brand-hue));
  --brand:   oklch(0.55 0.20  var(--brand-hue));
  --brand-fg:oklch(0.98 0.01  var(--brand-hue));
  --accent:  oklch(0.72 0.19  calc(var(--brand-hue) + 180));  /* sharp complementary accent */
  --muted:   oklch(0.96 0.01  var(--brand-hue));
  --border:  oklch(0.90 0.01  var(--brand-hue));
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:     oklch(0.17 0.02 var(--brand-hue));
    --fg:     oklch(0.96 0.01 var(--brand-hue));
    --brand:  oklch(0.68 0.19 var(--brand-hue));
    --muted:  oklch(0.26 0.02 var(--brand-hue));
    --border: oklch(0.32 0.02 var(--brand-hue));
  }
}
```

## Expose to Tailwind v4 (CSS-first — no tailwind.config.js)
```css
@import "tailwindcss";

@theme {
  --color-bg:     var(--bg);
  --color-fg:     var(--fg);
  --color-brand:  var(--brand);
  --color-accent: var(--accent);
  --color-muted:  var(--muted);
  --color-border: var(--border);

  --font-display: "Clash Display", ui-sans-serif, sans-serif;
  --font-body:    "General Sans",  ui-sans-serif, sans-serif;

  --radius: 0.5rem;

  /* 4px spacing grid */
  --spacing: 0.25rem;

  /* modular type scale (≈1.25), explicit so jumps are intentional */
  --text-sm: 0.875rem; --text-base: 1rem; --text-lg: 1.25rem;
  --text-xl: 1.563rem; --text-2xl: 1.953rem; --text-3xl: 2.441rem;
  --text-4xl: 3.052rem; --text-5xl: 3.815rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 150ms; --dur: 250ms;
}
```

## Rules
- **OKLCH only** for color; derive from `--brand-hue`.
- **No raw hex in components** — only `var(--token)` / Tailwind token utilities. (The token-conformance gate fails builds that violate this.)
- Validate contrast before locking: text ≥ 4.5:1, UI/non-text ≥ 3:1. Compute with `colorjs.io` / `culori` rather than eyeballing.
- Spacing values must land on the 4px grid; font sizes must come from the scale.
- **Seeding:** you may start from a tweakcn theme — `npx shadcn@latest add https://tweakcn.com/r/themes/<id>.json` — then refactor its values into the OKLCH + `--brand-hue` system above so it stays one-knob.
- Keep light + dark in sync; every semantic token defined in both.
