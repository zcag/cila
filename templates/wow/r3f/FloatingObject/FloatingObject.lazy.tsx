/* ============================================================================
   FloatingObject.lazy.tsx — Next.js (App Router) dynamic wrapper.

   The R3F body pulls in `three` (~600KB). NEVER let it into the server bundle or
   the initial client chunk. This wrapper code-splits it with `ssr:false` so:
     • three is loaded only on the client, only when this mounts;
     • it lands in its own async chunk (not the page's first load JS);
     • a token-coloured placeholder fills the box until it's ready.

   Mark this file (and the page that imports it) "use client".
   For Astro, you don't need this file — use `client:visible` on the .tsx
   directly (see ../README.md).
   ========================================================================== */
"use client";
import dynamic from "next/dynamic";
import type { FloatingObjectProps } from "./FloatingObject";

const FloatingObject = dynamic(() => import("./FloatingObject"), {
  ssr: false,
  // a no-CLS placeholder using the page bg token (no layout shift on swap)
  loading: () => (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: -1, background: "var(--color-bg)" }}
    />
  ),
});

export default function FloatingObjectLazy(props: FloatingObjectProps) {
  return <FloatingObject {...props} />;
}
