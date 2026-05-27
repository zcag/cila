# FloatingObject — Tier 2 (React island, R3F + drei + maath)

A glossy, organically-distorting 3D object that floats and tracks the pointer.
The "depth/3D wow" hero centerpiece.

## Deps

```bash
npm i three @react-three/fiber @react-three/drei maath
npm i -D @types/three
```

Verified (2026): `three@0.184`, `@react-three/fiber@9.6`, `@react-three/drei@10.7`,
`maath@0.10.8`. React 19.

## Files

| File | Role |
|------|------|
| `FloatingObject.tsx` | the island body (imports three) — load lazily |
| `FloatingObject.lazy.tsx` | Next.js `dynamic({ ssr:false })` wrapper + placeholder |

## Production patterns

- **drei `<Float>`** drives the ambient bob/sway declaratively (framerate-safe).
- **drei `<MeshDistortMaterial>`** gives the living, blobby surface; `clearcoat`
  + low roughness reads as glossy/premium.
- **Pointer parallax via maath `easing.damp3`** — exponential, framerate-
  independent damping (the correct smoothing; *not* `lerp(a, b, 0.1)` which is
  framerate-dependent). The pointer target lives in a **mutable ref**; the frame
  loop eases position/rotation toward it. **No React state in the loop.**
- **DPR capped `[1, 2]`.** `<Environment preset="studio" />` uses drei's bundled
  CC0 HDRI — no external asset, no network fetch.
- Lights are `useMemo`'d so the rig doesn't churn on re-render.

## Reduced motion (mandatory path)

When `prefers-reduced-motion: reduce`: `<Float>` speed/intensities → 0,
`MeshDistortMaterial` `distort`/`speed` → 0, pointer-tracking is skipped, and
`frameloop="never"` → a single static, undistorted, centered object. Still a
polished 3D render, just still.

## Pause when offscreen

`IntersectionObserver` flips `frameloop` between `"always"` and `"never"`. R3F
renders one frame on mount, so the object is correct before it moves.

## Brand tokens (no hardcoded colour)

`useBrandColor()` reads `--color-brand` → `THREE.Color` for the material; the hex
literal is a fallback seed only. Re-hue via `--brand-hue`.

## Lazy-load / code-split (REQUIRED — three is ~600KB)

- **Next:** import `FloatingObject.lazy.tsx` (it does `dynamic(..., {ssr:false})`
  + a `--color-bg` placeholder so there's no CLS on swap).
- **Astro:** `<FloatingObject client:visible />` on the `.tsx` — Astro already
  defers + hydrates only when scrolled into view, and `client:visible` keeps it
  out of the critical path. (Astro never SSRs a `client:` island's hydration JS
  into the initial bundle.)

> Note for SSR frameworks: this component calls `getComputedStyle` / `matchMedia`
> in effects (client-only), and `ssr:false` / `client:visible` guarantees it
> never runs on the server. Don't import the `.tsx` body directly into a server
> component.
