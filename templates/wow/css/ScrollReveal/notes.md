# ScrollReveal — Tier 1 (zero-dep, CSS scroll-driven)

Reveals children as they enter the viewport using the **native** CSS
`animation-timeline: view()` — no JavaScript, no IntersectionObserver, no
library. The browser drives the reveal on the compositor.

## Usage (Astro, static)

```astro
---
import ScrollReveal from "../../wow/css/ScrollReveal/ScrollReveal.astro";
---
<ScrollReveal class="grid gap-8 md:grid-cols-3" distance={28}>
  <article class="rounded-2xl border border-border bg-surface-raised p-8">…</article>
  <article class="rounded-2xl border border-border bg-surface-raised p-8">…</article>
  <article class="rounded-2xl border border-border bg-surface-raised p-8">…</article>
</ScrollReveal>
```

Each **direct child** is a reveal target. Layout classes go on the wrapper.

## Props

| Prop | Default | Notes |
|------|---------|-------|
| `distance` | `24` | px the children rise from |
| `stagger` | `true` | index-based range offsets so children don't resolve in lock-step (pure CSS, no `setTimeout`) |

## Fallbacks (this is the important part)

1. **No support** — wrapped in `@supports (animation-timeline: view())`. Browsers
   without scroll-driven animations (and SSR/no-JS) render children **at rest,
   fully visible**. Never hidden-and-stuck. This is real progressive enhancement.
2. **Reduced motion** — a `@media (prefers-reduced-motion: reduce)` block forces
   `opacity:1; transform:none; animation:none` so content is shown immediately.

> Browser support: `animation-timeline: view()` ships in Chromium and is behind
> graceful degradation everywhere else (Safari/Firefox fall to the visible-at-rest
> path). If you need the reveal in *every* engine, use `motion/react`'s
> `whileInView` (see `motion/OrchestratedHero`) — but accept the JS cost.

## Perf notes

- **Zero JS.** No IntersectionObserver, no scroll listener, no hydration.
- Compositor-only: animates `transform`/`opacity` only.
- The scroll-driven timeline runs off the main thread in supporting engines.

## Brand tokens

Token-agnostic — it animates only transform/opacity and adds no colour. Style the
children with semantic tokens as usual.

## Lazy-load / code-split

Nothing to split — pure CSS.
