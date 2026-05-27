# cila — Astro starter

A real, minimal-but-complete **Astro + Tailwind v4** marketing/landing starter,
wired to cila's token system and component registries. `/cila:init` copies this
into a new site. It is intentionally **not** default-shadcn: one OKLCH brand hue,
a CSS-first token contract, a distinctive type pairing, and one guarded motion
moment.

## Stack

- **Astro** (static output) — ~90% less JS, great Core Web Vitals; deploys to
  Cloudflare Pages.
- **Tailwind v4** via the `@tailwindcss/vite` plugin — **CSS-first `@theme`,
  no `tailwind.config.js`**.
- **OKLCH tokens** derived from a single `--brand-hue` (light + dark).
- **Self-hosted variable fonts** via Fontsource (no Google CDN):
  - Display: **Bricolage Grotesque** (`@fontsource-variable/bricolage-grotesque`)
  - Body: **Hanken Grotesk** (`@fontsource-variable/hanken-grotesk`)

> Font note: cila's default direction is Fontshare faces (Satoshi / General Sans /
> Clash). Those are **not redistributable on Fontsource** (Fontshare's license),
> so we ship the closest distinctive **OFL** equivalents that self-host cleanly:
> Bricolage Grotesque (a characterful variable grotesque with optical-size +
> width axes, the Clash/Cabinet-Grotesk lane) paired with Hanken Grotesk (a clean
> 100–900 grotesque body, the Satoshi/General-Sans lane). Swap freely — see below.

## Commands

```bash
npm install      # install deps (Astro, Tailwind v4, the two fonts)
npm run dev      # local dev server
npm run build    # static build → dist/
npm run preview  # preview the production build
```

> Build note: `vite` is pinned to `^7` in devDependencies on purpose. The current
> `@tailwindcss/vite` otherwise pulls Vite 8 (rolldown), which mismatches Astro's
> Vite 7 and breaks the Tailwind build (`Missing field tsconfigPaths`). One shared
> Vite 7 fixes it. Drop the pin once Astro moves to Vite 8.

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

`src/styles/global.css` only wires self-hosted fonts + a11y baselines
(focus-visible ring, `prefers-reduced-motion`, resets). It imports nothing that
competes with the token contract.

### Swapping fonts

Pick any OFL variable face on Fontsource, then update three places:

1. `package.json` → add `@fontsource-variable/<face>`.
2. `src/styles/global.css` → the `@import ".../wght.css"` line.
3. `src/styles/tokens.css` → `--font-display` / `--font-body` (the family string
   is `"<Face Name> Variable"`).
4. `src/layouts/Base.astro` → the `?url` preload import (point at the new
   `files/<id>-latin-wght-normal.woff2`).

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

> These registries emit **React/TSX**. To use interactive ones in Astro, add
> `@astrojs/react` and render them as islands (`client:load` / `client:visible`).
> Static, presentational components can be ported to `.astro` directly.

## What's included

A working hero + feature section + CTA + footer in `src/pages/index.astro` that
exercises the full token set, the Bricolage/Hanken pairing, an asymmetric
grid-breaking layout, a pure-CSS staggered page-load reveal (disabled under
`prefers-reduced-motion`), a no-flash dark-mode toggle, and a CSS-only brand
glow (layered `radial-gradient`, no image). Use it as the reference for how to
consume tokens — then replace the copy.
