---
name: wow
description: The playbook for jaw-dropping, award-tier hero moments — when and how to deploy 3D, shaders, generative backgrounds, custom hero art, and orchestrated motion without breaking accessibility or performance. Use when a build needs a signature 3D / shader / generative-background / big-motion moment — not for ordinary motion or layout polish.
---

# Wow — the jaw-dropping playbook

Goal: a hero/experience that makes people stop. The failure mode is two-sided — generic (no wow) *and* gaudy/janky/inaccessible (wrong wow). This playbook keeps it intentional and shippable.

## First, get the concept (don't reach for tech yet)
Jaw-dropping starts with an *idea*, not an effect. Before any 3D/shader:
1. **Anchor on real award-tier work.** Use the `reference-extract` skill — pull 2–3 references from Awwwards/Godly/Land-book (via the Steel MCP) or ones the user names, and decompose the *concept* (what makes it memorable: a single bold gesture, a material, a motion idea), not the pixels.
2. **Commit to ONE signature moment** from `DESIGN.md`. One unforgettable thing executed flawlessly beats five effects fighting each other. Everything else stays quiet to let it land.

## The wow menu (tiered by weight — prefer the lightest that achieves the concept)

**Tier 1 — zero-dependency (CSS/SVG), works in static Astro:**
- Animated **mesh-gradient** backgrounds driven by the brand hue; **grain/noise** overlays for depth; **native scroll-driven** reveals (`animation-timeline: scroll()/view()`, off-main-thread — the default for reveals, see `motion`); CSS 3D transforms / perspective; oversized expressive type with variable-font animation.
- **View Transitions** — animated route changes + hero/heading/image **morphs** across navigation (native, GPU-driven, no library). Often *the* "feels-2026" moment for multi-page sites → the `view-transitions` skill.
- Reach here first — see `${CLAUDE_PLUGIN_ROOT}/templates/wow/css/` and the `motion` skill.

**Tier 2 — React islands (depth & immersion):**
- **GLSL shader** backgrounds (flowing gradients, fbm noise, domain warp) → the `shaders` skill + `templates/wow/r3f/ShaderHero`.
- **3D** scenes / floating distorted meshes / particle fields → the `r3f` skill + `templates/wow/r3f/`.
- **Orchestrated motion** (staggered entrance, spatial continuity, scroll storytelling) → `motion` skill + `templates/wow/motion/`.
- In Astro, mount as islands (`@astrojs/react`, `client:visible`); in Next, dynamic import `ssr:false`.

**Custom hero imagery (optional, needs an API key):**
- AI-generated hero art / textures / OG images via an image-gen MCP (Nano Banana / fal) → optimize with `sharp`. Bespoke art beats stock. Wire only when the user has a key; otherwise stay on shaders/3D/CSS (all free, no key).

**Premium component sources:** React Bits (animated backgrounds/text), Aceternity (beams/spotlight/3D cards), Magic UI (motion polish) — pulled via the shadcn MCP, then **retuned to the brand tokens** so they read as one designed thing.

## Non-negotiable guardrails (wow that ships)
- **Accessibility is never traded for spectacle.** Every animation has a `prefers-reduced-motion` path (static frame / disabled loop). 3D/canvas content keeps the page keyboard-usable and provides a meaningful fallback. cila's a11y + reduced-motion gates apply to showcase pages too and are hard fails.
- **Perf is budgeted, not ignored.** Heavy hero → run the gates with the **showcase Lighthouse profile** (looser LCP/TBT) — but CLS stays strict, animations stay compositor-only (`transform`/`opacity`), and `non-composited-animations` stays a hard fail. Lazy-load/code-split Tier-2 islands, cap DPR, pause render when offscreen.
- **One moment, not everything.** Restraint is what reads as premium.
- **Tokens, not hardcoded color.** Shaders/3D take the brand hue as a uniform; nothing bypasses the token system.

## Flow
Concept (references) → commit one signature moment → pick the lightest tier that delivers it → build with the `r3f`/`shaders`/`motion` skills + `templates/wow` components → reduced-motion fallback → `design-reviewer` (showcase perf profile, strict a11y) → iterate until it lands.
