# cila — Next.js starter

A real, minimal-but-complete **Next.js (App Router) + Tailwind v4** app/dashboard
starter, wired to cila's token system and component registries. `/cila:go` copies
this into a new app (the **Astro** starter handles marketing/landing). It is
intentionally **not** default-shadcn: one OKLCH brand hue, a CSS-first token
contract, a distinctive type pairing, and one guarded motion moment.

## Stack

- **Next.js** (App Router, RSC) — server-first; deploys cleanly to Vercel. Client
  islands only for the interactive bits (theme toggle, the motion panel).
- **Tailwind v4** via the `@tailwindcss/postcss` plugin (`postcss.config.mjs`) —
  **CSS-first `@theme`, no `tailwind.config.js`**.
- **OKLCH tokens** derived from a single `--brand-hue` (light + dark). Shares the
  **exact** token contract with the Astro starter, so a brand reads identically
  across marketing + app.
- **Self-hosted variable fonts** via Fontsource (no Google CDN):
  - Display: **Bricolage Grotesque** (`@fontsource-variable/bricolage-grotesque`)
  - Body: **Hanken Grotesk** (`@fontsource-variable/hanken-grotesk`)
- **Motion** via [`motion`](https://motion.dev) (`motion/react`) for the one
  orchestrated beat — reduced-motion guarded, transform/opacity only.

> Font note: cila's default direction is Fontshare faces (Satoshi / General Sans /
> Clash). Those are **not redistributable on Fontsource** (Fontshare's license),
> so we ship the closest distinctive **OFL** equivalents that self-host cleanly:
> Bricolage Grotesque (a characterful variable grotesque with optical-size +
> width axes, the Clash/Cabinet-Grotesk lane) paired with Hanken Grotesk (a clean
> 100–900 grotesque body, the Satoshi/General-Sans lane). Swap freely — see below.

## Commands

```bash
npm install      # install deps (Next, Tailwind v4, motion, the two fonts)
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # next lint
```

## Where the brand lives

**One knob.** Open `src/styles/tokens.css` and change `--brand-hue` (an OKLCH
hue angle, 0–360) in the `:root` block. Every accent, ring, gradient, shadow and
hover state re-derives from it — OKLCH keeps contrast intact through the swap.
Secondary knobs in the same block: `--accent-hue` (the tension color) and the
`--chroma-*` saturation ceilings (muted ↔ loud).

`tokens.css` is the **single source of truth**. Layout order:

1. `@import "tailwindcss"` + dark-mode variant.
2. `:root` knobs (the brand hue + ramp inputs — this is what you edit).
3. `@theme` — semantic tokens → Tailwind utilities (`bg-bg`, `text-fg`,
   `bg-brand`, `rounded-lg`, `text-7xl`, the 4px spacing scale, the type scale).
4. `.dark` — remaps the **same semantic names** for dark mode.

`src/styles/globals.css` only wires self-hosted fonts + a11y baselines
(focus-visible ring, `prefers-reduced-motion`, resets). It imports nothing that
competes with the token contract. Both are imported once, in
`src/app/layout.tsx` (tokens first, then globals).

> If you re-hue meaningfully, also update the two `themeColor` hexes in
> `layout.tsx`'s `viewport` export — they're the rendered `--color-bg` (light /
> dark) and tint the browser address bar.

### Swapping fonts

Pick any OFL variable face on Fontsource, then update three places:

1. `package.json` → add `@fontsource-variable/<face>`.
2. `src/styles/globals.css` → the `@import ".../wght.css"` line.
3. `src/styles/tokens.css` → `--font-display` / `--font-body` (the family string
   is `"<Face Name> Variable"`).

Prefer Next's font pipeline? Swap the Fontsource `@import`s for `next/font/local`
pointing at the woff2 in `node_modules/@fontsource-variable/<face>/files/...` and
expose its CSS variable as `--font-display` / `--font-body`. The current setup
self-hosts via the Fontsource CSS (bundled + fingerprinted by Next), which keeps
the family names bit-identical to the Astro starter.

## How this maps to `DESIGN.md`

`DESIGN.md` is cila's locked **design contract**; this starter is its runtime
expression. The contract's tokens (brand hue, type scale, radii, spacing, motion
rules) land 1:1 in `src/styles/tokens.css`, and the production gates
(token-conformance, layout-invariant, contrast) assert the rendered DOM **against
those same tokens** — the test suite *is* the design system. When you re-hue or
re-type here, mirror the decision in `DESIGN.md` so the contract and the code
never drift apart.

## Adding components (free premium registries)

`components.json` wires the free namespaced registries cila pulls via the
**shadcn MCP / CLI**:

| Namespace     | Lane                                            |
| ------------- | ----------------------------------------------- |
| `@shadcn`     | base primitives / blocks / charts               |
| `@magicui`    | motion polish (MIT)                             |
| `@aceternity` | hero "wow" (hardcodes colors → remap to tokens) |
| `@origin`     | 400+ advanced primitives                        |
| `@cult`       | distinctive + AI/agent UI                       |
| `@reactbits`  | animated backgrounds / text                     |

```bash
npx shadcn add @magicui/marquee
npx shadcn add @aceternity/bento-grid
npx shadcn add @origin/comp-01
```

Each `registry-item.json` ships its own `cssVars`. After adding, run the shadcn
**audit checklist** and fold any new tokens into `src/styles/tokens.css` (don't
let a component introduce a parallel color source). Aceternity in particular
hardcodes hex — remap those to `--color-brand` / `--color-accent`.

> These registries emit **React/TSX** — which is native here. Drop them straight
> into the App Router (server components by default; add `"use client"` only for
> interactive ones). The Tier-2 **`templates/wow`** components also import
> directly: `motion/OrchestratedHero` is already `"use client"` with no `three`,
> so import it as-is; for the `three`-based ones (`ShaderHero`, `FloatingObject`)
> use `next/dynamic(() => import(...), { ssr: false })` so `three` stays out of
> the server bundle (`FloatingObject.lazy.tsx` ships a ready-made wrapper).

## What's included

A working hero + feature section + CTA + footer in `src/app/page.tsx` (a server
component) that exercises the full token set and the Bricolage/Hanken pairing in
an asymmetric grid-breaking layout, plus two client islands:

- `src/components/theme-toggle.tsx` — no-flash dark-mode toggle (the pre-paint
  script lives in `layout.tsx`).
- `src/components/live-panel.tsx` — the **one wow moment**: an orchestrated
  on-mount reveal of a live-feeling analytics panel built on `motion/react`
  (staggered entrance, a "drawing-in" bar group, and a spatial-continuity
  shared-`layoutId` range pill). Fully disabled under `prefers-reduced-motion`
  via `useReducedMotion()` — it renders a static, fully-composed frame. Use it as
  the reference for how to add motion that still passes cila's gates, then replace
  the copy.
