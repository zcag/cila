# cila — Next.js app shell

A real, focused **application shell** the way cila lays one down for apps,
dashboards, and internal tools — built on **Next.js (App Router) + Tailwind v4**
and wired to cila's token system. `/cila:go` copies this into a new app (the
**Astro** starter handles marketing/landing). It is intentionally **not**
default-shadcn: one OKLCH brand hue, a CSS-first token contract, a distinctive
type pairing, and shadcn-on-Radix components skinned entirely from tokens.

The demo app is **"Atlas"**, a fictional project-tracking tool — enough surface
to demonstrate the patterns without pretending to be a finished product.

## What's included — the app-shell patterns

**1. App shell** (`src/components/shell/`)

- A collapsible left **sidebar** (`sidebar.tsx`) — the primary nav. Toggles
  between a full labelled rail and a dense **icon rail**; collapsed is never
  icon-_only_ (each item keeps its label in a Radix tooltip on hover + focus).
  The collapse choice persists to `localStorage`. On mobile it becomes a
  focus-trapped Radix **drawer** opened from the header.
- A top **header** (`header.tsx`) — the utility bar: a global **⌘K search**
  trigger, a **notifications** menu, the theme toggle, and a **user / workspace**
  menu (all Radix dropdowns with correct keyboard + focus behaviour).
- A fluid, scrollable content area with a max-width measure, a **skip link**, and
  a `<main id="main">` that route changes move focus to.

**2. A data table** — Projects (`src/components/projects/`)

- Sortable columns (`aria-sort` reflects the live sort), a human-readable first
  column (the project name), right-aligned `tabular-nums` for budget.
- A `⋯` **row-action menu** (Radix DropdownMenu) and bulk-select **checkboxes**
  (tri-state header box) that pin a **bulk-action bar** with an Undo-style flow.
- A **debounced** filter box (INP-aware — filtering waits 200 ms after typing).
- **The full state set**, switchable from a control on `/projects`:
  - **loading skeleton** (`table-states.tsx`, content-shaped, `aria-busy` +
    polite status — no spinner flash),
  - **empty** (status + teach + a primary CTA),
  - **error** (plain language + a Retry, no raw stack),
  - plus the no-results case inside the ideal table.

**3. An accessible form** — create project (`project-form.tsx`)

- Single-column, **labels above**, correct `type` / `inputMode` / `autocomplete`.
- **Inline-on-blur validation** (react-hook-form `mode: "onBlur"`), live-clearing
  as you fix it, with an **always-enabled submit** that validates and **focuses
  the first error** (never a disabled button).
- Full WCAG wiring via the shadcn **`Form`** layer (`src/components/ui/form.tsx`):
  per-field `label` / `aria-invalid` / `aria-describedby` / `role="alert"`.

**4. A ⌘K command palette** (`command-palette.tsx`)

- `cmdk` inside a Radix Dialog — the APG combobox contract (virtual focus, arrow
  keys, type-ahead) plus a focus **trap + restore**. Wired to the **same nav
  config** as the sidebar (it's an accelerator, never the only path) plus a
  couple of actions. Opens on **⌘K / Ctrl-K** or the header search field.

**5. A small overview dashboard** (`src/app/page.tsx`)

- ≤5 **KPI cards** in F-pattern order (most important top-left), deltas shown
  with an icon **and** a sign (never colour-only), then a "recently updated"
  list that drills into the table.

**Cross-cutting a11y / perf** (the interaction layer scanners miss): route-change
focus + a polite **live region** announce navigations (`route-announcer.tsx`);
toasts use Sonner's **pre-existing** `aria-live` region so async feedback is
announced without stealing focus; all overlay motion is transform/opacity only
and neutralised by the `prefers-reduced-motion` guard in `globals.css`; hit
targets clear the WCAG 2.5.8 24 px floor.

## Stack

- **Next.js** (App Router, RSC) — server-first; pages are server components, with
  client islands only for the interactive bits (table, form, palette, shell
  state). Deploys cleanly to Vercel.
- **Tailwind v4** via `@tailwindcss/postcss` — **CSS-first `@theme`, no
  `tailwind.config.js`**.
- **OKLCH tokens** derived from a single `--brand-hue` (light + dark). Shares the
  **exact** token contract with the Astro starter.
- **shadcn-on-Radix** components in `src/components/ui/` — owned, editable source
  (Radix gives the ARIA / keyboard / focus contracts), re-skinned to cila tokens
  (no raw hex, no parallel colour source). Plus `cmdk` (palette),
  `react-hook-form` + `zod` (form), `sonner` (toasts), `lucide-react` (icons).
- **Self-hosted variable fonts** via Fontsource (no Google CDN): Bricolage
  Grotesque (display) + Hanken Grotesk (body).
- **Motion** via [`motion`](https://motion.dev) is available for any orchestrated
  beat (reduced-motion guarded, transform/opacity only).

> Font note: cila's default direction is Fontshare faces (Satoshi / General Sans
> / Clash), which aren't redistributable on Fontsource, so we ship the closest
> distinctive **OFL** equivalents that self-host cleanly. Swap freely — see below.

## Commands

```bash
npm install      # install deps
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
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
   `bg-brand`, `bg-muted`, `rounded-lg`, the 4px spacing scale, the type scale).
4. `.dark` — remaps the **same semantic names** for dark mode.

Every component in `src/components/ui/` uses those semantic names directly
(`bg-surface-raised`, `text-fg-muted`, `border-border`, …) — so re-hueing
re-skins the whole shell, and nothing introduces a hardcoded colour.
`src/styles/globals.css` wires self-hosted fonts, a11y baselines (focus-visible
ring, `prefers-reduced-motion`), and the small token-free overlay enter/exit
keyframes the Radix components reference (so there's **no** `tailwindcss-animate`
dependency). Both are imported once, in `src/app/layout.tsx` (tokens first).

> If you re-hue meaningfully, also update the two `themeColor` hexes in
> `layout.tsx`'s `viewport` export — they're the rendered `--color-bg` (light /
> dark) and tint the browser address bar.

### Swapping fonts

Pick any OFL variable face on Fontsource, then update three places:

1. `package.json` → add `@fontsource-variable/<face>`.
2. `src/styles/globals.css` → the `@import ".../wght.css"` line.
3. `src/styles/tokens.css` → `--font-display` / `--font-body` (the family string
   is `"<Face Name> Variable"`).

## How this maps to `DESIGN.md`

`DESIGN.md` is cila's locked **design contract**; this starter is its runtime
expression. The contract's tokens (brand hue, type scale, radii, spacing, motion
rules) land 1:1 in `src/styles/tokens.css`, and the production gates
(token-conformance, layout-invariant, contrast, the app-state gates) assert the
rendered DOM **against those same tokens**. When you re-hue or re-type here,
mirror the decision in `DESIGN.md` so the contract and the code never drift.

## Adding components (free premium registries)

`components.json` wires the namespaced shadcn registries. The base
shadcn-on-Radix UI primitives already live in `src/components/ui/` (added as
source, the shadcn way) — for anything more, pull via the **shadcn MCP / CLI**:

```bash
npx shadcn add @magicui/marquee        # motion polish (MIT)
npx shadcn add @aceternity/bento-grid  # hero "wow" (remap its hex to tokens)
npx shadcn add @origin/comp-01         # 400+ advanced primitives
```

Each `registry-item.json` ships its own `cssVars`. After adding, run the shadcn
**audit checklist** and fold any new tokens into `src/styles/tokens.css` (don't
let a component introduce a parallel color source). Aceternity in particular
hardcodes hex — remap those to `--color-brand` / `--color-accent`.

> These registries emit **React/TSX** — native here. Server components by
> default; add `"use client"` only for interactive ones.
