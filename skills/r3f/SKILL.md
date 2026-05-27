---
name: r3f
description: Production patterns for 3D web with React Three Fiber + drei — hero scenes, floating/distorted meshes, particle fields, scroll-driven 3D — built to be performant, lazy-loaded, and accessible. Use when a "wow" build calls for real 3D/WebGL depth.
---

# React Three Fiber — production 3D

Reference scenes live in `${CLAUDE_PLUGIN_ROOT}/templates/wow/r3f/` — copy/adapt them rather than writing from scratch. This skill is the rulebook. For real models / HDRIs / textures beyond procedural geometry, use the `3d-assets` skill.

## Setup
- Deps: `three @react-three/fiber @react-three/drei maath`.
- **Astro:** mount as a React island — `@astrojs/react`, `<Scene client:visible />` so it only loads/animates when in view.
- **Next:** `const Scene = dynamic(() => import('./Scene'), { ssr: false })` — WebGL can't SSR.
- Never block first paint on the 3D bundle; it's an enhancement layered over a real, readable hero.

## Performance (most 3D jank is here)
- **Cap DPR:** `<Canvas dpr={[1, 1.75]}>` — never render at full retina DPR.
- **Render on demand** when the scene is static-ish: `frameloop="demand"` + `invalidate()` on change; otherwise pause when offscreen (IntersectionObserver / drei `<AdaptiveDpr>` / `<PerformanceMonitor>`).
- **Mutate refs in `useFrame`, never React state** — setState per frame trashes performance.
- Instancing (`<Instances>`) for many repeated objects; `<Bvh>` for raycast-heavy scenes; dispose geometries/materials.
- Keep draw calls + triangle counts modest; prefer a striking *material/lighting* over geometry density.

## Motion quality
- **Exponential damping, not linear tweens:** `maath`'s `easing.damp3(ref.current.position, target, 0.25, delta)` — frame-rate independent, feels organic.
- drei helpers: `<Float>`, `<MeshDistortMaterial>`, `<Environment>`, `<ContactShadows>`, `<Sparkles>` for fast high-quality results.
- Tie color to the brand: pass `--brand-hue` (resolved to a hex/oklch) into materials; don't hardcode.

## Accessibility & reduced motion (hard gates)
- Honor `useReducedMotion()` (from `motion/react`) or a `matchMedia('(prefers-reduced-motion: reduce)')` check: render a **single static frame** (`frameloop="never"`) or a designed poster image instead of the live scene.
- The 3D layer is decorative: keep real content in the DOM, keyboard-navigable, with the hero's message readable without WebGL. Mark the canvas `aria-hidden` and provide the meaningful content as normal HTML.
- Provide a `[data-reduced-fallback]` static element so the reduced-motion gate can verify it.

## Pattern (shape)
```tsx
// Scene.tsx — island; lazy, capped DPR, damped, reduced-motion aware
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { easing } from 'maath'
import { useRef } from 'react'
import { useReducedMotion } from 'motion/react'

function Blob() {
  const ref = useRef<any>(null)
  useFrame((s, dt) => { if (ref.current) easing.damp3(ref.current.rotation, [0, s.clock.elapsedTime * 0.15, 0], 0.5, dt) })
  return <Float><mesh ref={ref}><icosahedronGeometry args={[1, 8]} /><MeshDistortMaterial distort={0.4} speed={1.2} /></mesh></Float>
}

export default function Scene() {
  const reduce = useReducedMotion()
  return (
    <Canvas aria-hidden dpr={[1, 1.75]} frameloop={reduce ? 'never' : 'always'} camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={0.6} /><directionalLight position={[3, 3, 3]} />
      <Blob />
    </Canvas>
  )
}
```
Build it against the verified components in `templates/wow/r3f/`, then run `design-reviewer` (showcase perf profile, strict a11y/reduced-motion).
