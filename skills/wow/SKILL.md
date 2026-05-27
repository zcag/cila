---
name: wow
description: The playbook for striking, award-tier hero moments that make people stop — led by REAL assets (product video, Rive/Lottie, live embeds, premium components) over hand-rolled CSS, plus shaders/3D/canvas, with a signature-moment carve-out so the hero can be spectacular without the page-level gates throttling it. Use BY DEFAULT for any hero-led marketing build (opt out only for deliberately minimal), and whenever a build must be striking, not merely tasteful.
---

# Wow — the striking-hero playbook

Goal: a hero that makes people stop. Two failure modes: **generic** (no wow — the common one) and **gaudy/janky** (wrong wow). Hard lesson from real builds: *a coding agent prompted in prose reliably produces tasteful-but-generic motion* — staggered fades it can't escape. So wow comes from a **concept + a real asset**, not from hand-rolled CSS hoping to feel premium.

## 1. Concept first (idea, not effect)
- **Anchor on real award-tier work — mandatory, not optional.** Pull 2–3 references (Awwwards / Godly / Land-book via a browser MCP, or ones the user names) with the `inspiration` skill, and decompose the *concept* — the one bold gesture / material / motion idea — not the pixels.
- **Commit to a concrete, NAMED signature moment** in `DESIGN.md` — not "a moment," but *the* moment ("hero = the product rendering itself, live"). More only if the concept earns it; never scatter. When the product's value is visual, **the product demonstrating itself IS the wow** — show it big and real, never an abstract illustration.

## 2. Pick the medium — real assets beat generated CSS (in order of impact)
1. **Real product video / screen-recording** — the truth, recorded. How Linear / Vercel / Notion do their hero. Highest meaning-per-effort for a real product. `<video>` muted/looping/`playsinline` + poster, ≤~6s, compressed (or animated AVIF/WebP).
2. **Live product embed** — render the actual product in the hero (uniquely available when it's *your* product). Maximum authenticity.
3. **Designed motion asset — Rive / Lottie** — bespoke vector animation built in a real tool (`@rive-app/react-canvas`, or Lottie) for a *meaningful* sequence (e.g. a transformation) that CSS can't convincingly fake.
4. **Premium interaction components** — React Bits / Aceternity / Magic UI (animated backgrounds, beams, text effects) via the shadcn MCP, **retuned to brand tokens**. Pre-built award-tier, not improvised.
5. **Shaders / 3D / canvas** — GLSL backgrounds (flowing gradients, fbm noise, domain warp), R3F scenes, particle fields, custom/AI hero art. See `${CLAUDE_PLUGIN_ROOT}/templates/wow/r3f/` (ShaderHero, FloatingObject) + `templates/wow/css/` (MeshGradient, Grain). Astro → islands (`client:visible`); Next → `dynamic(ssr:false)`. Brand hue as a uniform; cap DPR; pause offscreen. (AI hero art needs an image-gen key — optional.)
6. **Pure CSS** — mesh-gradient + grain; native scroll-driven reveals (`animation-timeline: view()`, off-main-thread — see `motion`); **View Transitions** morphs across navigation (shared `view-transition-name` on one hero/heading/image → it morphs instead of crossfading; reduced-motion disables the anim, keeps the DOM swap; same-origin only, Firefox cross-doc flagged → degrades gracefully). Cheapest, weakest — use to *support* a signature, rarely AS the signature.

Prefer the lightest medium that genuinely delivers the *concept* — but don't default to CSS just because it's easy; that's exactly how you get tasteful-not-striking.

## 3. The signature-moment carve-out (so wow isn't throttled)
The one designated signature moment may use **richer techniques than the rest of the page** — layout animation, canvas/WebGL, video — and is **exempt from the page's compositor-only / strict-CLS conventions**, on two conditions:
- **Isolate it** — render inside a `<canvas>`, `<video>`, or a contained / absolutely-positioned layer so it doesn't shift page layout (overall CLS stays clean).
- **The non-negotiables below still hold.** Everything *outside* the carve-out stays calm and clean.

This is deliberate: the production gates are right for the whole page and were a cage for the one hero moment — the carve-out frees it.

## Guardrails (wow that ships)
- **Accessibility is never traded for spectacle.** Every animation has a `prefers-reduced-motion` path (static frame / no loop); video gets a static poster. Canvas/3D keeps the page keyboard-usable with a meaningful fallback. The a11y + reduced-motion gates are hard fails — carve-out included.
- **Perf is budgeted, not ignored.** Heavy hero → showcase Lighthouse profile (looser LCP/TBT). Lazy-load/code-split islands, compress assets.
- **Tokens, not hardcoded color.** Nothing bypasses the token system.
- **One moment, not everything.** Restraint is what reads as premium.

## Flow
Concept (mandatory references) → name one signature moment in `DESIGN.md` → pick the medium (asset over CSS) → build it in an isolated carve-out → reduced-motion fallback → `design-reviewer` (showcase perf, strict a11y, judges the moment for *meaning*, not just presence) → iterate until it lands.
