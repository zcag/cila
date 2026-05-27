---
name: shaders
description: GLSL shader recipes for striking, brand-tuned backgrounds — animated gradient meshes, flowing fbm noise, domain warping, grain — performant and reduced-motion-safe. Use for atmospheric "wow" backgrounds when CSS gradients aren't enough.
---

# Shaders — generative backgrounds

Parameterized GLSL is the highest impact-per-byte "wow" background. Instantiate the vetted recipes in `${CLAUDE_PLUGIN_ROOT}/templates/wow/r3f/ShaderHero` rather than writing shaders blind. This skill is the rulebook + the building blocks.

## When to use vs CSS
- **CSS mesh-gradient first** (Tier 1, `templates/wow/css/MeshGradient`) — zero deps, works in static Astro. Reach for shaders only when you need *flow/organic motion/depth* CSS can't give.
- Shaders = a React island (`@react-three/fiber` + drei `shaderMaterial`) over a full-viewport quad, or a standalone canvas.

## Author in TSL, render WebGPU→WebGL2 (default)
- Write new shaders in **TSL** (Three.js Shading Language — the node/JS API), not raw GLSL. TSL compiles to **both WGSL and GLSL**, so the same recipe runs under the **WebGPU-primary renderer with automatic WebGL2 fallback** (see `r3f` — WebGPU is Baseline Jan 2026 but **mobile is fragmented**, so the fallback is mandatory). The uniforms/recipes below map 1:1 to TSL nodes (`uniform()`, `mx_noise`/`mx_fractal_noise`, `time`, `uv()`).
- Raw GLSL via `shaderMaterial` is still fine for *adapting an existing shader*; for anything new, prefer TSL so it's backend-portable.

## Recipes (uniforms: `uTime`, `uResolution`, `uBrand` color, optional `uMouse`)
- **Flowing gradient** — interpolate 2–3 brand-derived colors across UV with a slow `sin(uTime)` drift.
- **fbm noise field** — fractal Brownian motion (sum of octaves of value/simplex noise) → soft organic clouds.
- **Domain warp** — feed fbm into the coords of another fbm → liquid, marbled motion (the "expensive-looking" one).
- **Grain** — cheap hash noise added at low opacity to kill banding and add texture.
Drive all color from `uBrand` (pass `--brand-hue` resolved to RGB) so it stays on-system; never hardcode palette in the shader.

## Performance
- Render at **reduced resolution** (a low-DPR render target or a downscaled canvas upsampled) — fragment shaders are fill-rate bound; full retina is wasteful.
- **Pause when offscreen** (IntersectionObserver → stop the frame loop) and when the tab is hidden.
- Keep octave counts modest (fbm 4–5 octaves max); avoid heavy per-pixel branching.
- It's a background: it must never compete with content for the GPU during interaction.

## Reduced motion & accessibility (hard gates)
- `prefers-reduced-motion: reduce` → **freeze `uTime`** (render one static frame) or fall back to the CSS mesh-gradient. Provide a `[data-reduced-fallback]`.
- Canvas is decorative: `aria-hidden`, never carries content or focus; the hero reads fully without it.

## Shape
```glsl
// fragment — flowing brand gradient + grain (sketch)
uniform float uTime; uniform vec2 uResolution; uniform vec3 uBrand;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
// ... fbm(uv + uTime*0.03) → mix(bg, uBrand, n); + grain hash(uv*uResolution)*0.04
```
```tsx
// TSL node material (or drei shaderMaterial for adapted GLSL) in an R3F island;
// uTime frozen when reduced-motion (see r3f skill). WebGPU renderer → WebGL2 fallback.
```
Pair with the `r3f` skill for the island/perf/reduced-motion plumbing, then gate via `design-reviewer` (showcase perf profile, strict a11y).
