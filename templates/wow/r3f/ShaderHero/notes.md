# ShaderHero — Tier 2 (React island, R3F + drei)

A full-viewport GLSL shader background: a domain-warped fbm-noise gradient
coloured from the brand hue. Reach for this when you want real depth/motion that
CSS can't fake.

## Deps

```bash
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
```

Verified versions (2026): `three@0.184`, `@react-three/fiber@9.6` (React 19
compatible), `@react-three/drei@10.7`. Needs React 19.

## Uniforms

| Uniform | Source |
|---------|--------|
| `uTime` | advanced in `useFrame` via a **mutable ref** (never React state) |
| `uResolution` | `useThree().size`, synced on resize |
| `uColor` | resolved from `--color-brand` token at mount/theme-change |
| `uColorBg` | resolved from `--color-bg` token |

## Production patterns (why this compiles and runs cool)

- **drei `shaderMaterial()` + `extend()`** → the material is a typed JSX element
  (`<gradientMaterial />`) with named uniforms. The `declare module` block makes
  it type-safe in R3F v9.
- **Mutable refs in the frame loop.** `uTime` is incremented on
  `mat.current.uTime`, not via `setState` — no per-frame React re-render.
- **DPR capped at `[1, 2]`** — 4K/retina won't render at 4× pixel count.
- **Fullscreen triangle** (3 verts) instead of a quad — no diagonal seam, one
  fewer triangle, and `frustumCulled={false}` so it's never culled.
- `gl={{ antialias:false, alpha:false }}` — a fullscreen gradient needs neither.

## Reduced motion (mandatory path)

`useReducedMotionPref()` watches the media query. When reduced:
`frameloop="never"` and `uTime` is seeded to a fixed value (`12.0`) and rendered
**once** → a static, fully-composed shader frame. No animation, still a finished
visual.

## Pause when offscreen

An `IntersectionObserver` on the wrapper flips `frameloop` between `"always"`
(on-screen) and `"never"` (off-screen). R3F still renders one frame on mount, so
the background is correct even before it animates. Zero GPU when scrolled past.

## Brand tokens (no hardcoded colour)

`useBrandColor()` resolves `--color-brand` / `--color-bg` from
`getComputedStyle(:root)` and feeds them as `THREE.Color` uniforms; it re-syncs
on theme flip. The hex literals in the file are **fallback seeds only** (used
before the token resolves / in tests) — the shader's actual colour is always the
token. Re-hue via `--brand-hue`.

## Drop-in

- **Astro:** `<ShaderHero client:visible />` (needs `@astrojs/react`).
- **Next:** `const ShaderHero = dynamic(() => import("..."), { ssr: false })`.

See `../README.md` for the full island wiring and the hard a11y/reduced-motion
gate rule.
