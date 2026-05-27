---
name: view-transitions
description: Native View Transitions API for smooth page-transition / morph / multi-page-navigation effects — same-document (SPA-style) and cross-document (MPA), with named morphs on hero/heading/image. Use when a build needs animated route changes, element morphs across navigation, or a "feels-2026" transition between pages/states.
---

# View Transitions

Native, GPU-driven crossfades + element morphs between two DOM states — no JS animation library, no layout-thrash. Always **progressive enhancement**: feature-detected, the page works identically without it.

## Two modes
- **Same-document** (SPA-style, in-page state swap) — `document.startViewTransition(() => updateDOM())`. **Baseline (Oct 2025)** — broadly safe.
- **Cross-document** (MPA, real navigation) — opt in via CSS `@view-transition { navigation: auto; }` on **both** pages. Chromium + Safari ship it; **Firefox cross-doc is flagged** → it just navigates normally there (graceful). **Same-origin only.** Pairs with **Speculation Rules** prerender → the transition feels instant.

## Framework wiring
- **Astro:** add `<ClientRouter />` (from `astro:transitions`) in the `<head>` — gives cross-doc-style transitions today and degrades to full nav. Use `transition:name="..."` / `transition:animate` directives on elements; `transition:persist` to keep an element (audio/video/island) alive across nav.
- **Next (App Router):** `@view-transition { navigation: auto; }` in global CSS for cross-doc; the `<ViewTransition>` component (React) wraps same-doc/router transitions. Tie shared elements with `view-transition-name`.

## Named transitions (the morph)
Give the same `view-transition-name` to an element on **both** states and it *morphs* (position/size/shape interpolate) instead of crossfading. Reserve it for the **one signature continuity moment** — usually hero, page heading, or a thumbnail→detail image.

```css
.hero-title { view-transition-name: hero-title; }   /* same name both pages → morphs */
.card-img   { view-transition-name: var(--card-id); } /* unique per item: thumbnail → detail */
```
- A `view-transition-name` must be **unique per snapshot** — never give two visible elements the same name in one state (the transition errors out). For lists, template a per-item name.
- The default root crossfade is `::view-transition-old(root)` / `::view-transition-new(root)`; target a named one with `::view-transition-group(hero-title)`.

## Reduced motion (hard gate)
Guard every transition — morphs are motion. Disable the animation, keep the (instant) DOM swap:
```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}
```
In JS, when reduced-motion is set, just run the DOM update without wrapping it in `startViewTransition`.

## Caveats
- **Same-origin only**; cross-doc needs the opt-in on *both* documents.
- **Firefox cross-doc = flagged** → don't rely on it; same-doc is the Baseline-safe default.
- Keep `view-transition-name`s unique; tune duration short (≤ the `--dur` token) so nav still feels fast.
- It's polish layered on working navigation — never the only path to content.

Cross-ref: `motion` (scroll-driven reveals + the one-signature-moment rule), `wow` (Tier-1 menu).
