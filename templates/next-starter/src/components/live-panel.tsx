"use client";
/* ============================================================================
   live-panel.tsx — the ONE wow moment, as a client island.

   This is the app/dashboard analogue of the Astro starter's CSS page-load
   reveal: a "live" product panel that orchestrates ONE intentional beat on
   mount instead of scattering micro-interactions. Built on `motion/react`
   (the lib formerly known as Framer Motion), per cila's motion guidance.

   What it demonstrates (and why it's not generic):
     • Orchestrated entrance — a parent `variants` container staggers its rows
       in as a single cascade (header → bars → footer), not N independent fades.
     • Data-feel — the bar group animates its heights from 0 to a seeded series
       (scaleY, compositor-only), reading as a chart "drawing in".
     • Spatial continuity — the active-row pill is a shared `layoutId` element:
       clicking a tab slides the SAME pill to the new tab (Motion interpolates
       its bounding box) rather than cross-fading two pills.

   Mandatory motion rules honored:
     • useReducedMotion() → stagger, offsets, bar-draw and the layout slide all
       collapse to their rest state: the panel appears fully composed, instantly.
     • transform/opacity ONLY (y / scaleY / opacity) — no layout-thrashing props.
     • colors come exclusively from semantic tokens (bg-brand, text-fg, …) — no
       literals, so a --brand-hue swap re-skins the wow.
   ========================================================================== */
import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const TABS = ["7d", "30d", "90d"] as const;
type Tab = (typeof TABS)[number];

// seeded series per range (0–1), so the "draw-in" is deterministic, not random
const SERIES: Record<Tab, number[]> = {
  "7d": [0.42, 0.55, 0.38, 0.7, 0.52, 0.81, 0.64],
  "30d": [0.3, 0.46, 0.4, 0.58, 0.49, 0.62, 0.55, 0.73, 0.68, 0.9],
  "90d": [0.22, 0.34, 0.41, 0.36, 0.52, 0.48, 0.6, 0.57, 0.71, 0.66, 0.84, 0.95],
};

export function LivePanel() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("30d");
  const data = SERIES[tab];

  // container drives the stagger; reduced motion zeroes it
  const container: Variants = {
    hidden: {},
    show: {
      transition: reduced ? {} : { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };
  // each block rises + fades; reduced → rest state, instant
  const block: Variants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] },
    },
  };

  return (
    <motion.figure
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full rounded-2xl border border-border bg-surface-raised p-6 shadow-lg"
      aria-label="Sample analytics panel"
    >
      {/* header row */}
      <motion.figcaption variants={block} className="flex items-center justify-between">
        <div>
          <p className="text-sm text-fg-subtle">Active sessions</p>
          <p className="font-display text-3xl font-semibold leading-none text-fg">
            12,840
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-sm font-medium text-brand-strong">
          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
          +18.2%
        </span>
      </motion.figcaption>

      {/* range tabs — the active pill is the shared layoutId element */}
      <motion.div
        variants={block}
        role="tablist"
        aria-label="Date range"
        className="mt-6 flex w-fit gap-1 rounded-full border border-border bg-surface p-1"
      >
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              className="relative rounded-full px-3.5 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              {active && (
                <motion.span
                  // shared element: clicking a tab slides this same pill over
                  layoutId={reduced ? undefined : "range-pill"}
                  className="absolute inset-0 rounded-full bg-brand"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                  aria-hidden="true"
                />
              )}
              <span className={`relative ${active ? "text-fg-on-brand" : "text-fg-muted"}`}>
                {t}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* bar group — draws in from the baseline (scaleY, compositor-only) */}
      <motion.div
        variants={block}
        className="mt-6 flex h-32 items-end gap-1.5"
        aria-hidden="true"
      >
        {data.map((v, i) => (
          <motion.span
            key={`${tab}-${i}`}
            className="flex-1 origin-bottom rounded-sm bg-brand/35 last:bg-brand"
            style={{ height: `${Math.round(v * 100)}%` }}
            initial={reduced ? { scaleY: 1 } : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.5, delay: 0.3 + i * 0.025, ease: [0.2, 0.7, 0.2, 1] }
            }
          />
        ))}
      </motion.div>

      <motion.div
        variants={block}
        className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-fg-muted"
      >
        <span>Updated just now</span>
        <span className="font-mono text-fg-subtle">{tab} window</span>
      </motion.div>
    </motion.figure>
  );
}
