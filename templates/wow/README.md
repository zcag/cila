# cila — "wow" component library

Real, build-verified reference components the generator **copies and adapts** to
produce jaw-dropping hero sections. Research (RESEARCH.md §9) shows agents fail at
WebGL/shaders/motion without vetted patterns — so these actually compile and run,
honour the production gates, and read **only** from the brand tokens in
`src/styles/tokens.css` (one knob: `--brand-hue`). No hardcoded colour anywhere.

> These are **patterns to adapt**, not an npm package. Copy the file(s) you need
> into the target repo, keep the reduced-motion path, wire the deps below.

---

## The hard rule (non-negotiable)

**Wow must still pass cila's a11y + reduced-motion gates.** Never ship motion
without a reduced-motion path. Every component here:

- has an explicit `prefers-reduced-motion: reduce` fallback that renders a
  **static, fully-composed frame** (Tier 2 R3F: `frameloop="never"` + one frame;
  CSS: animation removed, parked at rest; Motion: variants collapse to rest);
- animates **transform/opacity only** (compositor-only) so it passes the
  Lighthouse "non-composited animations" audit (gates §lh);
- carries `aria-hidden="true"` on decorative backdrops so the a11y tree stays
  clean (gates §a11y);
- introduces **no colour of its own** — colours resolve from semantic tokens, so
  the token-conformance gate (`playwright/token-conformance.spec.ts`) stays green
  and a `--brand-hue` swap re-skins the wow.

If a wow component can't satisfy these, it doesn't ship. The gates are derived
from the token contract; the wow layer is no exception.

---

## Which wow, when

```
Marketing / landing / static Astro  ───────────►  TIER 1 (CSS/SVG, zero-dep)
  cheapest, zero JS, first-paint, no hydration       MeshGradient · Grain · ScrollReveal

Want real depth / 3D / shader motion  ─────────►  TIER 2 (React islands)
  app or Astro+@astrojs/react / Next                 ShaderHero · FloatingObject · OrchestratedHero
  (accept the JS cost; always lazy-load)
```

| # | Component | Tier | Tech | Use it for |
|---|-----------|------|------|------------|
| 1 | `css/MeshGradient` | 1 | layered radial-gradients (+ SVG `feTurbulence` variant) | animated mesh-gradient hero backdrop |
| 2 | `css/Grain` | 1 | SVG `feTurbulence` noise overlay | film-grain texture, kills banding |
| 3 | `css/ScrollReveal` | 1 | native `animation-timeline: view()` | scroll-in reveals, no JS |
| 4 | `r3f/ShaderHero` | 2 | R3F + drei `shaderMaterial` GLSL | full-viewport animated shader background |
| 5 | `r3f/FloatingObject` | 2 | R3F + drei `<Float>`/`MeshDistortMaterial` + `maath` | glossy 3D hero centerpiece, pointer parallax |
| 6 | `motion/OrchestratedHero` | 2 | `motion` (`motion/react`) | staggered entrance + spatial-continuity CTA (no 3D) |

**Default to Tier 1** for marketing/static. It's the cheapest wow, renders at
first paint with zero hydration, and is the right answer most of the time. Reach
for Tier 2 only when you specifically want depth/3D/shader work — and combine
sparingly (one Tier-2 centerpiece per hero, not three).

**Cheapest Tier 2** is `motion/OrchestratedHero` (no `three`, pure DOM
transforms). Use it when you want orchestrated motion but not WebGL.

---

## Exact deps per component

| Component | Install |
|-----------|---------|
| All Tier 1 (`css/*`) | **none** (pure CSS/SVG) |
| `r3f/ShaderHero` | `npm i three @react-three/fiber @react-three/drei` + `-D @types/three` |
| `r3f/FloatingObject` | `npm i three @react-three/fiber @react-three/drei maath` + `-D @types/three` |
| `motion/OrchestratedHero` | `npm i motion` |

### Verified versions (2026 — build-verified, see "Build verification" below)

```
three                 0.184.x
@react-three/fiber    9.6.x      (R3F v9 = React 19 era)
@react-three/drei     10.7.x
maath                 0.10.x
motion                12.40.x    (import from "motion/react")
react / react-dom     19.x
@types/three          0.184.x    (devDep; match three's minor)
```

Pins/assumptions:
- **R3F v9 requires React 19.** If the target repo is on React 18, stay on R3F
  v8 (`@react-three/fiber@^8`, `@react-three/drei@^9`) — the component code is
  compatible, only the `ThreeElements`/`ThreeElement` typing import path differs.
- `motion` is the current package name (was `framer-motion`); import from
  `motion/react`. `framer-motion@11` works too with the same import surface if a
  repo already has it.
- Tailwind v4 token utilities (`bg-brand`, `text-fg`, …) come from the cila
  `tokens.css` `@theme` — the Motion component assumes it's present.

---

## Dropping a React island into Astro (`@astrojs/react`)

1. Add the React integration once:
   ```bash
   npx astro add react      # installs @astrojs/react + react + react-dom
   ```
2. Import the `.tsx` into an `.astro` file and hydrate with a `client:` directive:
   ```astro
   ---
   import ShaderHero from "../../wow/r3f/ShaderHero/ShaderHero.tsx";
   import OrchestratedHero from "../../wow/motion/OrchestratedHero/OrchestratedHero.tsx";
   ---
   <section class="relative isolate min-h-[80vh] overflow-hidden">
     <!-- heavy R3F backdrop: only hydrate when scrolled into view -->
     <ShaderHero client:visible />
     <!-- above-the-fold motion beat: hydrate on load -->
     <OrchestratedHero client:load />
   </section>
   ```
   - **`client:visible`** for backdrops / below-fold 3D — Astro defers the JS and
     only hydrates when the island scrolls into view (keeps it out of the
     critical path). Pairs with the components' own IntersectionObserver pause.
   - **`client:load`** for an above-the-fold orchestrated entrance.
   - R3F components also need their effects to run client-only; `client:*`
     guarantees that (Astro never SSRs island hydration JS).

## Dropping a React island into Next.js (App Router, `ssr:false`)

For anything that imports `three`, code-split it so `three` never enters the
server bundle or the initial client chunk:

```tsx
// app/page.tsx  (or a client component)
"use client";
import dynamic from "next/dynamic";

const ShaderHero = dynamic(() => import("@/wow/r3f/ShaderHero/ShaderHero"), {
  ssr: false,
  loading: () => <div style={{ position: "absolute", inset: 0, zIndex: -1, background: "var(--color-bg)" }} />,
});

export default function Page() {
  return (
    <section style={{ position: "relative", minHeight: "80vh", overflow: "hidden" }}>
      <ShaderHero />
      {/* OrchestratedHero is already "use client" with no three → import directly */}
    </section>
  );
}
```

`FloatingObject` ships a ready-made wrapper for this — import
`FloatingObject.lazy.tsx` (it does the `dynamic({ ssr:false })` + a no-CLS
`--color-bg` placeholder).

---

## Lazy-load / code-split guidance (summary)

- **Tier 1**: nothing to split. Pure CSS/SVG, first-paint, zero hydration.
- **Tier 2 with `three`** (`ShaderHero`, `FloatingObject`): ALWAYS lazy. Astro →
  `client:visible`; Next → `dynamic({ ssr:false })`. `three` is ~600KB — keeping
  it out of the initial bundle is the single biggest perf lever for these.
- **`motion/OrchestratedHero`**: `motion` is small; `client:load` (Astro) or a
  direct `"use client"` import (Next) is fine. Still no SSR of browser APIs (it
  uses none at module scope).
- All Tier 2 components **pause when offscreen** (IntersectionObserver →
  `frameloop:"never"`) and **cap DPR at `[1,2]`** — so even when mounted they
  don't burn GPU when scrolled past or on hi-DPI displays.

---

## Reduced-motion at a glance (the gate the agent must not skip)

| Component | Reduced-motion behaviour |
|-----------|--------------------------|
| MeshGradient (radial) | `@media` removes drift; layers parked at composed transform → still gradient |
| MeshGradient (SVG) | inline script removes SMIL `<animate>`; or pass `static` |
| Grain | shimmer removed; static full-cover grain remains |
| ScrollReveal | `@media` forces visible-at-rest; also degrades where `view()` unsupported |
| ShaderHero | `frameloop:"never"` + one seeded static shader frame |
| FloatingObject | `<Float>`/distort → 0, pointer-tracking off, `frameloop:"never"` → still object |
| OrchestratedHero | `useReducedMotion()` collapses stagger + offsets + shared-element travel |

---

## Build verification

The Tier-2 React components were compiled clean-room (a throwaway Vite + React 19
+ TypeScript project, fresh `npm install` of the exact deps above, then
`tsc --noEmit` + `vite build`). They build with zero type errors. The throwaway
project and its `node_modules` are **not** committed — these templates ship as
source only. To re-verify, see the steps in the cila repo's report or recreate a
Vite+React+TS app, drop the `.tsx` files in, install the deps, and run
`tsc --noEmit && vite build`.
