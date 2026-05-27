---
name: motion
description: Add production-grade motion to a cila site — one orchestrated high-impact moment, compositor-only animation, and mandatory reduced-motion guards. Use when building animations/transitions/reveals in React (motion/react) or static HTML (CSS).
---

# Motion

**One well-orchestrated moment beats scattered micro-interactions.** Attention is finite; animating everything fatigues it. The sophistication is in the restraint.

## Library choice
- **React:** `motion` (import from `motion/react`) — MIT, hybrid WAAPI engine. Prefer it over GSAP for generated output (GSAP is Webflow-owned with a license barring competing tools).
- **Static HTML / Astro:** CSS-only — staggered `animation-delay`, `@keyframes`, view/scroll timelines where supported. Add `tailwindcss-motion` / `tailwind-animations` for cheap class-based reveals.

## Non-negotiable rules
- **Animate `transform` and `opacity` only** (compositor/GPU). Never `width/height/top/left/margin`; never `transition: all` — list properties.
- **Always guard non-essential motion:**
  ```css
  @media (prefers-reduced-motion: no-preference) { /* animations here */ }
  ```
  Provide a static/instant variant for `reduce`. In `motion/react`, respect `useReducedMotion()`.
- UI transitions **< 300ms**; ambient loops 3–6s with relaxed easing, seamless (`alternate` or matched keyframes).
- Animations must be **interruptible** — respond to input mid-flight.
- Easing: `cubic-bezier(0.16,1,0.3,1)` (the `--ease-out` token) for natural decel.
- Correct `transform-origin`; for SVG, wrap in `<g>` with `transform-box: fill-box; transform-origin: center`.
- Animate a wrapper, not text nodes; use `will-change`/`translateZ(0)` sparingly to force a layer only when needed.

## The signature moment
Pick ONE per page from `DESIGN.md`'s "signature moment": a staggered hero entrance, or spatial continuity (animate a thumbnail's bounding box → its expanded position, showing the relationship). Make it deliberate; everything else stays quiet.

## Example — staggered reveal (motion/react)
```tsx
import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, i = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```
The compositor-only + reduced-motion rules are enforced by the gates — animation that fails them fails the build.
