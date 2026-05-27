/* ============================================================================
   OrchestratedHero.tsx — Tier 2 React island. ONE orchestrated page-load moment:
   a staggered hero entrance with spatial continuity, built on `motion`
   (`motion/react`, the lib formerly known as Framer Motion).

   This is the "one high-impact orchestrated moment > scattered micro-
   interactions" pattern from the research. A parent `variants` container
   staggers its children in; the eyebrow → headline → subcopy → CTA cascade
   reads as a single intentional beat.

   Spatial-continuity demo: the CTA's accent dot is a `layoutId` shared element.
   On hover the dot animates from the button into a ring around the arrow —
   Motion interpolates the *bounding box* from source to destination, so it
   reads as one object moving, not two things fading.

   Mandatory motion rules honoured:
     • useReducedMotion() — when true, ALL variants collapse to the rest state
       (no translate, no stagger): content appears instantly, fully visible.
     • transform/opacity ONLY (x/y/scale/opacity) — never layout-thrashing props.
     • the orchestration is a single load beat; hover is a <300ms micro-move.

   Stack (2026): motion@12 (`motion/react`), React 19.
   Drop into Astro with client:load / client:visible, or Next as a "use client"
   component. See ../README.md.
   ========================================================================== */
"use client";
import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

export interface OrchestratedHeroProps {
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function OrchestratedHero({
  eyebrow = "cila · orchestrated entrance",
  title = (
    <>
      Design that doesn't <span className="text-brand">drift</span> to the mean.
    </>
  ),
  subtitle = "One orchestrated load beat — eyebrow, headline, subcopy and CTA stagger in as a single intentional moment. Honors reduced motion. Transform and opacity only.",
  ctaLabel = "See the system",
  ctaHref = "#",
}: OrchestratedHeroProps) {
  const reduced = useReducedMotion();

  /* Container drives the stagger. When reduced, stagger + child offsets are
     zeroed (see `item`) so children simply appear. */
  const container: Variants = {
    hidden: {},
    show: {
      transition: reduced
        ? {}
        : { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };

  /* Each child rises + fades. Reduced motion → no transform, instant. */
  const item: Variants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0 }
        : { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] },
    },
  };

  return (
    <motion.section
      className="relative mx-auto max-w-4xl px-6 py-28 text-center md:py-36"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.p
        variants={item}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-sm font-medium text-fg-muted"
      >
        <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
        {eyebrow}
      </motion.p>

      <motion.h1
        variants={item}
        className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-fg sm:text-6xl lg:text-7xl"
      >
        {title}
      </motion.h1>

      <motion.p
        variants={item}
        className="mx-auto mt-6 max-w-xl text-lg text-fg-muted"
      >
        {subtitle}
      </motion.p>

      <motion.div variants={item} className="mt-10 flex justify-center">
        <SpatialCta href={ctaHref} label={ctaLabel} reduced={!!reduced} />
      </motion.div>
    </motion.section>
  );
}

/* ── Spatial-continuity CTA. A single `layoutId` element ("cta-dot") lives in
   two visual states; Motion interpolates its bounding box between them, so it
   reads as one object travelling — the textbook spatial-continuity example. ── */
function SpatialCta({
  href,
  label,
  reduced,
}: {
  href: string;
  label: string;
  reduced: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.a
      href={href}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3 font-medium text-fg-on-brand shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {/* shared element: resting position is the leading dot */}
      {!hover && (
        <motion.span
          layoutId={reduced ? undefined : "cta-dot"}
          className="size-2 rounded-full bg-fg-on-brand"
          aria-hidden="true"
        />
      )}
      {label}
      <span className="relative inline-flex size-5 items-center justify-center" aria-hidden="true">
        {/* shared element: hovered position is a ring around the arrow */}
        {hover && (
          <motion.span
            layoutId={reduced ? undefined : "cta-dot"}
            className="absolute inset-0 rounded-full border-2 border-fg-on-brand"
          />
        )}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </motion.a>
  );
}
