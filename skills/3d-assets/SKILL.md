---
name: 3d-assets
description: Source and load real 3D assets (models, HDRIs, PBR textures) for R3F "wow" scenes — Poly Haven (CC0, keyless) and poly.pizza (low-poly) — with glTF loading, compression, licensing, and the same perf/a11y guardrails. Use when a 3D scene needs real assets beyond procedural geometry.
---

# 3D assets

Pairs with the `r3f` skill. Prefer procedural geometry + drei primitives/materials first; fetch real assets only when the concept needs them.

## Sources
- **Poly Haven** (`polyhaven.com`) — **CC0**, keyless public API: HDRIs (lighting/reflections via drei `<Environment>`), PBR textures (`useTexture`), and models. No attribution required → the default.
- **poly.pizza** — large low-poly model catalog; free API key (free hobby / PAYG commercial) → glTF download URLs. Good for stylized props.
- **Sketchfab** — Download API is gated by per-user OAuth → deprioritize for autonomous use.

## Loading in R3F
- Models: drei `useGLTF(url)` (+ `<Clone>` for repeats); `useGLTF.preload(url)` to avoid pop-in.
- Lighting/material: `<Environment files={hdri} />`; textures via `useTexture`.
- **Compress before shipping:** `gltf-transform` (draco/meshopt) on models; cap texture sizes (≤2k typical); use KTX2/AVIF where supported. Instancing for many repeats; LOD for heavy scenes.

## Rules
- **Licensing:** prefer CC0 (Poly Haven); record attribution where a source requires it. Never ship assets you can't license.
- **Perf + a11y still apply** (`r3f` skill): cap DPR, pause render offscreen, reduced-motion → static frame, `aria-hidden` on the decorative canvas, lazy-load the island. A heavy model that blows the perf budget isn't shippable — optimize or simplify.
- Tie visible materials to the brand tokens where it reads as brand.
