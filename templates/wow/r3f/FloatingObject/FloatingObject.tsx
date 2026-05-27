/* ============================================================================
   FloatingObject.tsx — Tier 2 React island. A glossy, organically-distorting
   3D object that floats and gently tracks the pointer. The signature
   "depth/3D wow" centerpiece for a hero.

   Stack (2026): @react-three/fiber v9 + @react-three/drei (`Float`,
   `MeshDistortMaterial`, `Environment`) + maath (`easing.damp3`).

   Production patterns:
     • drei <Float> for the ambient bob/sway (declarative, framerate-safe).
     • drei <MeshDistortMaterial> for the living, blobby surface.
     • Pointer parallax via maath `easing.damp3` — EXPONENTIAL DAMPING, the
       correct framerate-independent smoothing (not lerp-by-fixed-alpha). Target
       lives in a MUTABLE REF; the frame loop eases the mesh toward it. No React
       state in the loop.
     • DPR capped [1, 2]; pause when offscreen via IntersectionObserver →
       frameloop "never".
     • prefers-reduced-motion → Float speed 0 + distort 0 + frameloop "never":
       a still, undistorted object (one static frame).
     • Material colour from the --color-brand token (no hardcoded colour).

   This file is the island BODY. Always load it lazily / ssr:false (it pulls in
   three). See FloatingObject.lazy.tsx for the Next.js dynamic wrapper and
   ../README.md for the Astro client:visible wiring.
   ========================================================================== */
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { easing } from "maath";

function useBrandColor(varName = "--color-brand", fallback = "#3a8a5e") {
  const [color, setColor] = useState(() => new THREE.Color(fallback));
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (raw) {
      try {
        setColor(new THREE.Color(raw));
      } catch {
        /* keep fallback */
      }
    }
  }, [varName]);
  return color;
}

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

function Blob({ color, reduced }: { color: THREE.Color; reduced: boolean }) {
  const group = useRef<THREE.Group>(null!);
  // pointer target as a MUTABLE REF (never state) — written on move, read in loop
  const target = useRef(new THREE.Vector3(0, 0, 0));

  const { invalidate } = useThree();

  useEffect(() => {
    if (reduced) {
      // park the object centered and ask for one render
      target.current.set(0, 0, 0);
      if (group.current) group.current.position.set(0, 0, 0);
      invalidate();
    }
  }, [reduced, invalidate]);

  useFrame((state, delta) => {
    if (reduced || !group.current) return;
    // map normalized pointer (-1..1) to a small parallax offset
    target.current.set(state.pointer.x * 0.35, state.pointer.y * 0.25, 0);
    // exponential damping — framerate-independent smoothing (maath).
    // damp3 for the Vector3 position; dampE for the Euler rotation (correct API
    // for each type — no casting).
    easing.damp3(group.current.position, target.current, 0.35, delta);
    easing.dampE(
      group.current.rotation,
      [target.current.y * 0.4, target.current.x * 0.6, 0],
      0.4,
      delta,
    );
  });

  return (
    <group ref={group}>
      <Float
        // ambient bob/sway; all zeroed under reduced motion for a still frame
        speed={reduced ? 0 : 1.4}
        rotationIntensity={reduced ? 0 : 0.5}
        floatIntensity={reduced ? 0 : 0.9}
        floatingRange={[-0.1, 0.1]}
      >
        <mesh castShadow>
          <icosahedronGeometry args={[1.1, 24]} />
          <MeshDistortMaterial
            color={color}
            roughness={0.15}
            metalness={0.4}
            clearcoat={1}
            clearcoatRoughness={0.2}
            // freeze the surface warp under reduced motion
            distort={reduced ? 0 : 0.38}
            speed={reduced ? 0 : 1.6}
          />
        </mesh>
      </Float>
    </group>
  );
}

export interface FloatingObjectProps {
  className?: string;
  brandVar?: string;
}

export default function FloatingObject({
  className = "",
  brandVar = "--color-brand",
}: FloatingObjectProps) {
  const color = useBrandColor(brandVar);
  const reduced = useReducedMotionPref();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setOnScreen(e.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frameloop = reduced ? "never" : onScreen ? "always" : "never";

  // a soft key/fill rig in code (no asset files); memo so it doesn't churn
  const lights = useMemo(
    () => (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} castShadow />
        <directionalLight position={[-4, -2, -3]} intensity={0.4} />
      </>
    ),
    [],
  );

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, zIndex: -1 }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={frameloop}
        shadows
        camera={{ position: [0, 0, 4.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {lights}
        {/* CC0 studio HDRI from drei's bundled presets — no external asset */}
        <Environment preset="studio" />
        <Blob color={color} reduced={reduced} />
      </Canvas>
    </div>
  );
}
