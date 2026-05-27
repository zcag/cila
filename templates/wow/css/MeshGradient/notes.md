# MeshGradient — Tier 1 (zero-dep, CSS/SVG)

Animated mesh-gradient hero background driven entirely by brand tokens. Two
variants ship here; default to the first.

| File | Technique | When |
|------|-----------|------|
| `MeshGradient.astro` | layered radial-gradients, `transform`-only drift | **default** — full-bleed hero backdrop, cheapest, compositor-only |
| `MeshGradient.svg.astro` | `feTurbulence` + `feDisplacementMap` warp | only when you want a "liquid"/organic warped look; heavier (filter paints) |

## Usage (Astro, static)

```astro
---
import MeshGradient from "../../wow/css/MeshGradient/MeshGradient.astro";
---
<section class="relative isolate overflow-hidden">
  <MeshGradient duration={24} />
  <div class="relative mx-auto max-w-6xl px-6 py-32">
    <h1 class="text-7xl font-semibold text-fg">Your hero copy</h1>
  </div>
</section>
```

The wrapper is `position:absolute; inset:0; z-index:-1`, so the host just needs
`position: relative` (or `isolate`) and `overflow: hidden`.

## Reduced motion

- `MeshGradient.astro`: a `@media (prefers-reduced-motion: reduce)` block removes
  the drift `animation` and parks each layer at a composed transform → a still,
  finished gradient frame.
- `MeshGradient.svg.astro`: SMIL `<animate>` cannot be paused by CSS, so a tiny
  `is:inline` script removes the `<animate>` node when reduced motion is
  requested. You can also pass `static` to ship a frozen frame for everyone.

## Perf notes

- **Compositor-only.** Layers animate `transform: translate3d(...)` / `opacity`
  only — never `background-position`, never the gradient stops, never layout
  props. Passes the Lighthouse "non-composited animations" audit.
- `will-change: transform` is set on the moving layers; the reduced-motion block
  resets it to `auto` so we don't keep idle GPU layers around.
- `filter: blur(60px)` is the one cost; it's a static blur (not animated), so it
  rasterises once. Keep the blob count at 3.
- The SVG variant's `feDisplacementMap` repaints each SMIL tick — keep the
  displaced `<rect>` modest and verify it against your CWV/animation budget; if
  it fails, fall back to the layered-radial version.

## Brand tokens used (no hardcoded colour)

`--color-bg`, `--color-brand`, `--color-brand-soft`, `--color-accent-soft`.
Re-hue the entire effect by changing `--brand-hue` in `tokens.css`.

## Lazy-load / code-split

Tier 1 is pure CSS/SVG with (at most) one tiny inline script — there is nothing
to code-split. It renders at first paint with zero JS hydration. This is the
cheapest "wow" and the right default for marketing/static pages.
