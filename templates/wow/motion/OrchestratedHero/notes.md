# OrchestratedHero — Tier 2 (React island, Motion)

ONE orchestrated page-load moment: a staggered hero entrance with a spatial-
continuity CTA. The "one high-impact orchestrated beat > scattered micro-
interactions" pattern from the research, built on `motion`.

## Deps

```bash
npm i motion
```

Verified (2026): `motion@12.40` (import from `motion/react` — the lib formerly
known as Framer Motion). React 19. **No three, no R3F** — this is the light Tier 2
option (pure DOM transforms).

## What it demonstrates

- **Staggered entrance** — a parent `variants` container with `staggerChildren` /
  `delayChildren` cascades eyebrow → headline → subcopy → CTA as a single beat.
- **Spatial continuity** — the CTA's accent dot is a `layoutId` shared element.
  On hover/focus it travels from a leading dot into a ring around the arrow;
  Motion interpolates the **bounding box** source→destination, so it reads as one
  object moving, not two crossfading. This is the canonical spatial-continuity
  example called out in the research.

## Reduced motion (mandatory path)

`useReducedMotion()` is honoured everywhere:
- the container drops `staggerChildren`,
- the item variant's `hidden` state becomes the rest state (`opacity:1, y:0`)
  with `duration:0` → content appears instantly, fully visible,
- `whileHover`/`whileTap` lift is disabled,
- the `layoutId` shared-element travel is disabled (`layoutId` set to
  `undefined`), so there's no box interpolation.

## Perf / craft notes

- **transform + opacity only** (`x`/`y`/`scale`/`opacity`) — never `transition:
  all`, never layout-thrashing props. (Note: `layout`/`layoutId` animations DO
  measure layout, but Motion batches reads/writes and animates via transform —
  it's the supported way to do spatial continuity; it's gated off under reduced
  motion regardless.)
- The load beat is one orchestrated moment; the hover is a sub-300ms micro-move.
- `focus-visible:ring-*` keeps a real keyboard focus state on the CTA.

## Brand tokens (no hardcoded colour)

All colour via semantic Tailwind token utilities (`bg-brand`, `text-fg`,
`text-fg-muted`, `bg-accent`, `ring-ring`, `text-fg-on-brand`). No literals.
Requires the project's `tokens.css` (the cila Tailwind v4 `@theme`).

## Drop-in

- **Astro:** `<OrchestratedHero client:load />` (it's an above-the-fold load
  beat, so `client:load`; use `client:visible` if it's lower on the page). Needs
  `@astrojs/react`.
- **Next:** it's already `"use client"` — import directly into a client subtree.
  No `three`, so no need for `ssr:false`.
