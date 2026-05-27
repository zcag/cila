/* ============================================================================
   ShaderHero.tsx — Tier 2 React island. A full-viewport GLSL shader background:
   an animated domain-warped fbm-noise gradient, coloured from the brand hue.

   Stack (2026): @react-three/fiber v9 (React 19) + three + drei `shaderMaterial`.

   Production patterns baked in (the things agents get wrong without a vetted
   pattern):
     • Custom ShaderMaterial built with drei `shaderMaterial()` + `extend()` so
       it's a first-class JSX element with typed uniforms.
     • Uniforms updated via a MUTABLE REF in useFrame — never React state in the
       frame loop (state in the loop = re-render every frame = jank).
     • DPR capped at [1, 2] so retina/4K don't melt the GPU.
     • Pause when offscreen: an IntersectionObserver flips `frameloop` to
       "never" off-screen and back to "always" on-screen (no wasted GPU).
     • prefers-reduced-motion → frameloop "never" + we render exactly ONE frame
       (a static, fully-composed shader frame). No animation, still gorgeous.
     • Brand colour is read from the resolved `--color-brand` token at mount and fed
       in as a uniform — NO hardcoded colour in the shader.

   Drop into Astro with client:visible, or Next with dynamic({ ssr:false }).
   See ../README.md for the exact island wiring.
   ========================================================================== */
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

/* ── Read a token colour from the DOM (so the shader honours --brand-hue). ──
   tokens.css defines OKLCH custom props; we resolve the computed value of
   `--color-brand` to an actual rgb and hand three a THREE.Color. Runs in the
   browser only (this component is an ssr:false / client:visible island). */
function useBrandColor(varName = "--color-brand", fallback = "#3a8a5e") {
  const [color, setColor] = useState(() => new THREE.Color(fallback));
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (!raw) return;
    // THREE.Color parses CSS colours incl. oklch() in modern three; fall back
    // by painting it onto a canvas if the engine can't (defensive).
    try {
      setColor(new THREE.Color(raw));
    } catch {
      const probe = document.createElement("canvas").getContext("2d");
      if (probe) {
        probe.fillStyle = raw;
        setColor(new THREE.Color(probe.fillStyle));
      }
    }
  }, [varName]);
  return color;
}

/* ── The shader material. Domain-warped fbm noise → smooth flowing gradient. ──
   Uniforms: uTime, uResolution, uColor (brand), uColorBg (page bg). */
const GradientMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(1, 1),
    uColor: new THREE.Color("#3a8a5e"),
    uColorBg: new THREE.Color("#0a0f0c"),
  },
  /* vertex */ /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen tri in clip space
    }
  `,
  /* fragment */ /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2  uResolution;
    uniform vec3  uColor;
    uniform vec3  uColorBg;

    // -- value noise + fbm + domain warp (Inigo Quilez style) --
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i+vec2(0,0)), hash(i+vec2(1,0)), u.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
      return v;
    }
    void main(){
      // aspect-correct, centered coords
      vec2 uv = vUv;
      uv.x *= uResolution.x / uResolution.y;
      float t = uTime * 0.06;
      // domain warp: distort the lookup of a second fbm by a first
      vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2, 1.3) - t));
      vec2 r = vec2(fbm(uv + 1.7*q + vec2(8.3, 2.8)),
                    fbm(uv + 1.7*q + vec2(1.4, 9.2)));
      float f = fbm(uv + 2.0*r + t);
      // shape into a soft, flowing gradient between bg and brand
      float m = smoothstep(0.0, 1.0, f);
      vec3 col = mix(uColorBg, uColor, m);
      // a brighter brand-tinted highlight where the warp piles up
      col += 0.18 * uColor * pow(clamp(r.x, 0.0, 1.0), 2.0);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
);
extend({ GradientMaterial });

/* Make the custom element type-safe in JSX (R3F v9 typing). */
type GradientMaterialImpl = THREE.ShaderMaterial & {
  uTime: number;
  uResolution: THREE.Vector2;
  uColor: THREE.Color;
  uColorBg: THREE.Color;
};
declare module "@react-three/fiber" {
  interface ThreeElements {
    gradientMaterial: ThreeElement<typeof GradientMaterial>;
  }
}

function FullscreenPlane({
  color,
  bg,
  reduced,
}: {
  color: THREE.Color;
  bg: THREE.Color;
  reduced: boolean;
}) {
  const mat = useRef<GradientMaterialImpl>(null!);
  const { size, viewport, invalidate } = useThree();

  // keep the resolution uniform correct on resize
  useEffect(() => {
    if (mat.current) {
      mat.current.uResolution.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  // sync colours when tokens resolve / theme flips
  useEffect(() => {
    if (!mat.current) return;
    mat.current.uColor.copy(color);
    mat.current.uColorBg.copy(bg);
    invalidate(); // re-render the (possibly static) frame with new colours
  }, [color, bg, invalidate]);

  // advance time ONLY through the mutable ref — never via React state.
  // When `reduced` is true we leave uTime at a fixed seed = one static frame.
  useFrame((_, delta) => {
    if (reduced) return;
    if (mat.current) mat.current.uTime += delta;
  });

  // a single full-screen triangle (cheaper than a quad: no diagonal seam)
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3),
    );
    g.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2),
    );
    return g;
  }, []);

  // seed a pleasant static frame for the reduced-motion case
  useEffect(() => {
    if (reduced && mat.current) {
      mat.current.uTime = 12.0;
      invalidate();
    }
  }, [reduced, invalidate]);

  void viewport;
  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <gradientMaterial ref={mat} />
    </mesh>
  );
}

export interface ShaderHeroProps {
  /** extra classes on the wrapper (positioning/z-index) */
  className?: string;
  /** token name to colour the shader from */
  brandVar?: string;
  /** page-bg token (the colour the noise fades to) */
  bgVar?: string;
}

export default function ShaderHero({
  className = "",
  brandVar = "--color-brand",
  bgVar = "--color-bg",
}: ShaderHeroProps) {
  const color = useBrandColor(brandVar, "#3a8a5e");
  const bg = useBrandColor(bgVar, "#0a0f0c");
  const wrapRef = useRef<HTMLDivElement>(null);

  // reduced-motion: one static frame, frameloop off.
  const reduced = useReducedMotionPref();

  // pause when offscreen via IntersectionObserver → frameloop "never"/"always"
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // if reduced motion → never animate (single frame). else → animate only while
  // on screen. R3F renders once on mount even with frameloop "never".
  const frameloop = reduced ? "never" : onScreen ? "always" : "never";

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, zIndex: -1 }}
    >
      <Canvas
        // cap DPR so 4K/retina don't render at 4x the pixels
        dpr={[1, 2]}
        frameloop={frameloop}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        // no camera work needed; the fullscreen-tri ignores it
        orthographic
        camera={{ position: [0, 0, 1] }}
      >
        <FullscreenPlane color={color} bg={bg} reduced={reduced} />
      </Canvas>
    </div>
  );
}

/* Tiny SSR-safe prefers-reduced-motion hook (no extra dep). */
function useReducedMotionPref() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
