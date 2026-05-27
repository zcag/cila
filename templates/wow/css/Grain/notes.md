# Grain — Tier 1 (zero-dep, SVG feTurbulence)

A fine film-grain / luminance-noise overlay. Adds texture, kills gradient
banding, and gives flat token fills a tactile, premium feel. Static by default
(a single inline SVG noise tile = ~free); optional compositor-only shimmer.

## Usage (Astro, static)

```astro
---
import Grain from "../../wow/css/Grain/Grain.astro";
---
<section class="relative isolate overflow-hidden">
  <!-- background (e.g. MeshGradient) goes here at z-index:-1 -->
  <Grain opacity={0.06} />
  <div class="relative z-10">…content…</div>
</section>
```

Pair it with `MeshGradient` to break gradient banding. Grain sits at `z-index:1`;
put real content above it (`relative z-10`) or below it as needed.

## Props

| Prop | Default | Notes |
|------|---------|-------|
| `opacity` | `0.06` | film grain is subtle; 0.04–0.1 is the useful range |
| `frequency` | `0.8` | feTurbulence `baseFrequency`; higher = finer grain |
| `animate` | `false` | adds a subtle shimmer (compositor-only `transform`) |

## Reduced motion

`animate` is the only motion. A `@media (prefers-reduced-motion: reduce)` block
removes the shimmer `animation` and parks the tile as a full-cover **static**
grain — texture stays, movement stops.

## Perf notes

- The noise is a **static** inline `data:` SVG raster — no network request, no
  per-frame filter cost. It rasterises once.
- `mix-blend-mode: soft-light` modulates the underlying colour instead of greying
  it (so it works on any token background without a hardcoded colour).
- The optional shimmer animates `transform: translate3d(...)` only (compositor),
  with `steps()` timing for an authentic stepped-grain look — no paint/layout.
- Keep `opacity` low; high-opacity full-screen grain hurts text contrast (it can
  trip the a11y/contrast gate over text — keep grain off interactive/text layers
  or under 0.08).

## Brand tokens

Grain is colourless (luminance noise) by design, so it introduces **no** colour
of its own — it blends with whatever token background is underneath. Nothing to
re-hue.

## Lazy-load / code-split

Pure CSS/SVG, zero JS, renders at first paint. Nothing to split.
