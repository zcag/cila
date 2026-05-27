# cila production gates

Drop-in quality gates for a cila-enabled website. `/cila:init` copies this
`gates/` tree into the target repo and wires the scripts into its `package.json`
and CI. The gates are **derived from the design contract** (`DESIGN.md` +
`src/styles/tokens.css`): allow-sets for colors and type sizes are read at
runtime from the resolved CSS custom properties on `:root`, so *the test suite
is the design system*. Nothing here is hardcoded to a specific site.

## The governing principle

```
rules-based / structural gates  →  HARD fail   (run first, cheapest, strongest)
        │  (must be green)
        ▼
perceptual / visual + LLM judge  →  ADVISORY    (runs only after structural pass)
```

Structural gates assert **facts about the rendered DOM** — an agent can't charm
them. The visual-regression diff and the LLM/perceptual reviewer are advisory:
they flag for human review and **never override a hard structural fail**. A
build is shippable only when every structural gate is green *and* a human has
signed off on the taste-sensitive calls.

## What each gate checks

| Gate | File | Tier | Checks |
|------|------|------|--------|
| **tokens** | `playwright/token-conformance.spec.ts` | 1 — hard | Every visible element's computed `color` / `background-color` / `border-color` is a member of the allow-set resolved from `:root` custom props. Catches hardcoded `#3b82f6` and Tailwind arbitrary values that survive the build. |
| **tokens** | `playwright/spacing-scale.spec.ts` | 1 — hard | Computed margin/padding/gap land on the 4px grid (hairline tolerance); `font-size` ∈ the type scale read from `--text-*` / `--font-size-*` tokens. Catches "the agent picked 13px". |
| **tokens** | `stylelint.config.mjs` | 1 — hard | Static source guard: bans raw hex / `rgb()` / named colors in hand-authored CSS; forces color/shadow props through `var(--token)`. Runs before the build. |
| **layout** | `playwright/layout-invariants.spec.ts` | 1 — hard | Across 360/768/1024/1440: no horizontal scroll (`scrollWidth ≤ clientWidth`), no element overflows the inline axis, touch targets ≥ 24×24 (WCAG 2.5.8), no unintended interactive overlap (rect math + `elementsFromPoint` hit-test). |
| **a11y** | `playwright/a11y.spec.ts` | 1 — hard | `@axe-core/playwright` with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, run post-render across the viewport matrix. Full JSON attached to the report; zero violations required. |
| **motion** | `playwright/reduced-motion.spec.ts` | 1 — hard | Under `prefers-reduced-motion: reduce`, across the matrix: the page must be effectively static — **no continuous `requestAnimationFrame` loop** driving a canvas (catches raw rAF churn *and* an R3F `frameloop` still rendering) — **or** a visible documented `[data-reduced-fallback]` substitute. Measures real rAF activity in-page; can't be charmed by a self-reported flag. Applies to showcase pages too. |
| **lh** | `lighthouserc.json` | 2 — budget | Lighthouse CI: LCP < 2500ms, CLS < 0.1, TBT < 200ms (error); FCP/SI/INP (warn — INP is lab guidance, real INP needs field data); perf ≥ 0.9, a11y = 1.0, best-practices ≥ 0.95; non-composited-animations = 0. |
| **lh (showcase)** | `lighthouserc.showcase.json` | 2 — budget (opt-in) | **Relaxed *performance* budget for designated hero/marketing pages only.** LCP ≤ 4000ms, TBT ≤ 600ms, perf ≥ 0.6 (warn); script ≤ 2 MB, total ≤ 8 MB (error). Everything accessibility/layout-related stays strict: **CLS ≤ 0.1, non-composited-animations = 0, a11y ≥ 0.95, best-practices ≥ 0.95, unsized-images = 0** — same as (or matching) the default. Run via `gate:lh:showcase` and point its `url` at the hero route(s) only. |
| **visual** | `playwright/visual-regression.spec.ts` | 2 — advisory | `toHaveScreenshot` per route × viewport with `animations:'disabled'`, dynamic regions masked via `[data-visual-dynamic]`, `maxDiffPixelRatio: 0.01`. Baselines are the accept/reject memory from the critique loop. |

### Notes baked into the code

- **`toHaveCSS` can't read CSS custom properties** — it returns the raw
  `var(--x)` text. Token allow-sets are built with `page.evaluate` +
  `getComputedStyle(document.documentElement)`. See `playwright/_helpers.ts`.
- **`locator.isVisible()` lies under occlusion** — it checks the box, not the
  hit-test stack. Overlap detection uses `document.elementsFromPoint`.
- **Automation catches ~25-40% of WCAG issue types** — keep manual screen-reader
  spot-checks (NVDA / VoiceOver / TalkBack) each release. axe is the floor.
- **Tailwind arbitrary values** (`bg-[#abc]`, `p-[13px]`) live in className
  strings, invisible to stylelint. They're caught by their *effect* in the
  rendered token/spacing gates; optionally add an ESLint rule at the markup
  layer (see the header comment in `stylelint.config.mjs`).

## Wow vs gates

cila is built to ship pages with a real jaw-drop moment — a 3D/shader hero,
rich orchestrated motion. That ambition is allowed to cost *performance budget*,
and **nothing else**.

- **Always strict, on every page including showcase heroes:** the **tokens**,
  **layout**, **a11y**, **motion** (reduced-motion), and **visual** gates. A
  "wow" page does not get to ship hardcoded colors, off-grid spacing, horizontal
  scroll, undersized targets, axe violations, layout shift, non-composited
  animations, or an animation loop that ignores `prefers-reduced-motion`. These
  are accessibility / structural facts, not taste — they never relax.
- **The only thing that may flex** is the **Lighthouse performance budget**, and
  only for *designated* hero/marketing routes: switch those routes from
  `gate:lh` to `gate:lh:showcase`. That profile loosens LCP / TBT / perf-score
  and grants a bigger byte budget for an intentional showcase — while still
  enforcing CLS ≤ 0.1, `non-composited-animations` = 0, a11y ≥ 0.95, and
  best-practices ≥ 0.95.
- **The default `lighthouserc.json` stays strict** and is what every
  non-showcase page is measured against. Use the showcase profile sparingly and
  scope its `url` list to the hero route(s) only — never site-wide.

Rule of thumb: *performance can negotiate for a showcase; accessibility,
reduced-motion, layout and tokens never do.*

## npm scripts

| Script | Runs |
|--------|------|
| `npm run gate:tokens` | token-conformance + spacing-scale specs + stylelint |
| `npm run gate:layout` | layout-invariants spec |
| `npm run gate:a11y` | axe-core a11y spec |
| `npm run gate:motion` | reduced-motion fallback spec (HARD) |
| `npm run gate:visual` | visual-regression spec (`:update` to refresh baselines) |
| `npm run gate:lh` | Lighthouse CI, **strict** profile (`lhci autorun`) |
| `npm run gate:lh:showcase` | Lighthouse CI, **relaxed-perf** showcase profile — hero/marketing pages only |
| `npm run gate:structural` | tokens + layout + a11y + motion (all HARD gates) |
| `npm run gate` | structural → visual → lighthouse, in order |
| `npm run gate:report` | open the Playwright HTML report |

First-time setup in the target repo:

```bash
npm install
npx playwright install --with-deps chromium   # gate runner browser
npm run gate:visual:update                     # seed visual baselines (review them!)
```

## Configuration (env)

| Var | Default | Purpose |
|-----|---------|---------|
| `BASE_URL` | `http://localhost:4321` | Site under test. Next.js: `http://localhost:3000`. |
| `CILA_WEBSERVER_CMD` | `npm run preview` | Command Playwright runs to boot the site. Next: `npm run start`. |
| `PLAYWRIGHT_NO_WEBSERVER` | _unset_ | Set when CI already started the server; Playwright won't boot its own. |
| `CILA_ROUTES` | `/` | Comma-separated routes to gate, e.g. `"/,/about,/pricing"`. |
| `CILA_GRID` | `4` | Spacing-grid base in px. |

## How `/cila:init` wires these in

1. Copies `gates/playwright/`, `playwright.config.ts`, `lighthouserc.json`,
   `lighthouserc.showcase.json`, `stylelint.config.mjs` into the target repo
   (config at root, specs under a gated test dir).
2. Merges the `devDependencies` and `gate:*` scripts from this `package.json`
   into the repo's `package.json`.
3. Detects the stack (Astro vs Next) and sets `BASE_URL` / `CILA_WEBSERVER_CMD`
   defaults accordingly.
4. Adds `npm run gate:structural` (tokens + layout + a11y + **motion**) to the
   repo's CI as a **required** check and to cila's `Stop` / `SubagentStop` hook,
   so the build loop can't declare "done" while a structural gate is red.
   `gate:visual` + `gate:lh` run as advisory / budget checks. Pages with an
   intentional showcase hero swap `gate:lh` → `gate:lh:showcase` for those
   routes only (perf budget relaxes; a11y / reduced-motion / layout / tokens do
   not — see **Wow vs gates**).
