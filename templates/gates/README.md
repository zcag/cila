# cila production gates

Drop-in quality gates for a cila-enabled website. `/cila:go` copies this
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
| **tokens** | `playwright/token-conformance.spec.ts` | 1 — hard | Every visible element's computed `color` / `background-color` / `border-color` is a member of the allow-set resolved from `:root` custom props. Membership is **alpha-agnostic** — see *Opacity modifiers* below. Catches hardcoded `#3b82f6` and Tailwind arbitrary values that survive the build. |
| **tokens** | `playwright/spacing-scale.spec.ts` | 1 — hard | Computed **margin** lands on the 4px grid; **padding / gap** may land on the 2px sub-grid (Tailwind half-steps — see *Spacing rhythm* below). `font-size` ∈ the type scale read from `--text-*` / `--font-size-*` tokens. Catches "the agent picked 13px". |
| **tokens** | `stylelint.config.mjs` | 1 — hard | Static source guard: bans raw hex / `rgb()` / `hsl()` / `oklch()` / `color()` / `lab()` / `lch()` / named colors in hand-authored CSS; forces color/shadow props through `var(--token)`. Runs before the build. |
| **layout** | `playwright/layout-invariants.spec.ts` | 1 — hard | Across 360/768/1024/1440: no horizontal scroll (`scrollWidth ≤ clientWidth`), no element overflows the inline axis, touch targets ≥ 24×24 (WCAG 2.5.8 — **with the spec's Inline / Spacing / focus-enlarge exceptions applied**, see *Touch-target exceptions* below), no unintended interactive overlap (rect math + `elementsFromPoint` hit-test). |
| **a11y** | `playwright/a11y.spec.ts` | 1 — hard | `@axe-core/playwright` with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, run post-render across the viewport matrix. Full JSON attached to the report; zero violations required. |
| **a11y (overlay)** | `playwright/overlay-a11y.spec.ts` | frontier — **warn** | Best-effort native-overlay check: any *open* dialog/menu should be a native `<dialog>` / `[popover]`, or a hand-rolled `[role=dialog]` with proper `aria-modal` + focus management. A `<div role="dialog">` open without a focus trap (no focus inside, no `[data-focus-trap]`) **warns**; an open modal with **no accessible name** (no `aria-label`/`aria-labelledby`) **warns**; and the focus trap is **behaviorally verified** — it drives real `Tab` presses and warns if focus *escapes* the open modal. Only inspects overlays already open at gate time (closed overlays → axe + manual SR check). |
| **a11y (patterns)** | `playwright/pattern-a11y.spec.ts` | frontier — **warn** | App-UX interaction-layer checks axe can't see: **(1)** the `<div onClick>` anti-pattern — an element with an inline click handler that's not natively interactive and lacks `role` + `tabindex≥0` + a key handler. **(2)** **live region for async** — toast/notification-like containers present but no `[aria-live]`/`[role=status\|alert\|log]`/`<output>` in the DOM. **(3)** **pattern conformance** — `tablist`/`tab` (each tab `aria-selected`, selected tab `aria-controls`), `menu`/`menubar` (menuitems present, `aria-haspopup` triggers carry `aria-expanded`, `menuitemcheckbox/radio` carry `aria-checked`), `combobox` (`aria-expanded` + `aria-controls`/`aria-owns`), `switch` (`aria-checked`). |
| **schema** | `playwright/schema.spec.ts` | frontier — **warn** | Parses every `<script type="application/ld+json">`; each must be well-formed JSON and at least one must carry an `@type`. Malformed / type-less blocks always warn; *absence* on an expected content route (scoped by `CILA_SCHEMA_ROUTES`) warns. Never hard-fails. |
| **inp** | `playwright/responsiveness.spec.ts` | frontier — **warn** | INP/responsiveness *hygiene* checklist: no `transition: all`, compositor-only transitions (transform/opacity/filter), `content-visibility:auto` on long (>3×viewport) pages, and main-thread nudges (inline `on*` handlers, big inline `<script>`). Plus app-UX INP heuristics: **un-debounced high-frequency inline handlers** (`oninput`/`onscroll`/`onmousemove`/`onpointermove`/`onresize`/`onwheel`/`ontouchmove`/`ondrag`) and **unvirtualized long lists** (a list/table/grid with > ~200 row-like children in the DOM, `CILA_LONG_LIST`; `content-visibility` on the container/rows counts as mitigation). Lab proxy for INP is **TBT in the Lighthouse gate** (hard); this is the deterministic advisory companion. |
| **motion** | `playwright/reduced-motion.spec.ts` | 1 — hard | Under `prefers-reduced-motion: reduce`, across the matrix: the page must be effectively static — **no continuous `requestAnimationFrame` loop** driving a canvas (catches raw rAF churn *and* an R3F `frameloop` still rendering) — **or** a visible documented `[data-reduced-fallback]` substitute. Measures real rAF activity in-page; can't be charmed by a self-reported flag. Applies to showcase pages too. |
| **lh** | `lighthouserc.cjs` | 2 — budget | Lighthouse CI: LCP < 2500ms, CLS < 0.1, **TBT < 200ms (error — the lab proxy for INP)**; FCP/SI/INP (warn — lab INP is indicative; real INP needs field data, out of build-time scope); perf ≥ 0.9, a11y = 1.0, best-practices ≥ 0.95; non-composited-animations = 0. The deterministic INP hygiene checklist is the `inp` gate above. |
| **lh (showcase)** | `lighthouserc.showcase.json` | 2 — budget (opt-in) | **Relaxed *performance* budget for designated hero/marketing pages only.** LCP ≤ 4000ms, TBT ≤ 600ms, perf ≥ 0.6 (warn); script ≤ 2 MB, total ≤ 8 MB (error). Everything accessibility/layout-related stays strict: **CLS ≤ 0.1, non-composited-animations = 0, a11y ≥ 0.95, best-practices ≥ 0.95, unsized-images = 0** — same as (or matching) the default. Run via `gate:lh:showcase` and point its `url` at the hero route(s) only. |
| **visual** | `playwright/visual-regression.spec.ts` | 2 — advisory | `toHaveScreenshot` per route × viewport with `animations:'disabled'`, dynamic regions masked via `[data-visual-dynamic]`, `maxDiffPixelRatio: 0.01`. Baselines are the accept/reject memory from the critique loop. |

### Notes baked into the code

- **Spacing rhythm — margins 4px, padding/gap 2px.** Tailwind v4 half-step
  utilities (`py-1.5`/`gap-1.5` = 6px, `px-2.5` = 10px, with `--spacing:0.25rem`)
  are legitimate, idiomatic tokens that sit on a **2px** sub-grid. The
  `spacing-scale` gate holds the *outer* rhythm strict — **margins must be on
  the 4px grid** (`CILA_GRID`) — while permitting **padding and gap on the 2px
  sub-grid** (`CILA_PADDING_GRID`, default 2). Set `CILA_PADDING_GRID=4` to
  forbid half-steps entirely. Off-rhythm values (13px) are still caught either
  way. See `playwright/_helpers.ts` (`GRID` / `PADDING_GRID`) and
  `playwright/spacing-scale.spec.ts`.
- **Opacity modifiers on tokens are permitted.** Tailwind opacity modifiers
  (`bg-brand/35` → `color-mix(in oklab, var(--color-brand) 35%, transparent)`,
  `text-fg-on-brand/80` → an `rgba()` with partial alpha) are a sanctioned way
  to use a token at reduced alpha. `token-conformance` membership is therefore
  **alpha-agnostic**: a computed color is on-token when its base `r,g,b` matches
  an allowed token's base, regardless of the alpha applied. This covers both the
  `rgba` and the color-mix-with-transparent forms. See `buildColorAllowSet` /
  `baseColor` in `playwright/_helpers.ts`.
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
- **Touch-target exceptions (WCAG 2.5.8).** The 24×24 check now honors the
  spec's documented exceptions so legit patterns don't false-positive — a
  *genuinely small standalone control still fails*:
  - **(a) Inline.** A target whose computed `display` is `inline*` **and** that
    sits inside a flowing text block (its parent holds surrounding text) — a
    link wrapped in a sentence — is exempt.
  - **(b) Enlarges on focus.** A control that is collapsed / visually-hidden at
    rest but grows to ≥ 24×24 once focused (skip-links,
    visually-hidden-until-focus affordances) is exempt. The gate **actually
    focuses it and re-measures** — not a self-reported flag.
  - **(c) Sufficient spacing.** The spec's *Spacing* exception: a sub-24px
    target is exempt if a 24px-diameter circle on its center doesn't intersect
    any *other* target's circle. Approximated with each target's box expanded so
    its smaller side reaches 24px, then checked against every other target's
    expanded box (AABB analogue of the circle test).
  See the header comment + `touch targets` test in
  `playwright/layout-invariants.spec.ts`.
- **Warn-level frontier gates.** `schema`, `inp`, `overlay-a11y`, and
  `pattern-a11y` detect *heuristic* patterns (structured-data presence, INP
  hygiene, hand-rolled overlays, interaction-layer a11y). Their detection has
  legitimate exceptions, so per cila's frontier rule they **warn, never
  hard-fail** — findings are attached to the report (`gate:report`), annotated
  on the test, and printed to stderr via the shared `warn()` helper in
  `_helpers.ts`. Hard *facts* (layout/tokens/a11y/motion + the Lighthouse CWV
  budget) remain the real fails.
- **View-Transitions / Speculation-Rules (soft expectation).** On multi-page
  builds, a same-document/cross-document **View Transition**
  (`@view-transition` / the View Transitions API) and **Speculation Rules**
  (`<script type="speculationrules">` prerender/prefetch) are *soft* signals of
  a polished, instant-feeling navigation. cila does **not** gate on them (they're
  progressive enhancements, easy to false-positive), but a multi-page build
  that ships neither is leaving an easy win on the table — review by hand.

## App-UX gates (interaction layer)

axe and the structural gates cover the *markup* and *layout* layers; an app's
real quality lives one layer up, in **interaction** — keyboard operability,
focus management, async announcements, and the keyboard/AT contract of composite
widgets (the WAI-ARIA APG patterns). These are mostly heuristic, so — per cila's
frontier rule — they **warn** and never hard-fail; only the genuinely
deterministic facts hard-fail (and those already live in the axe / layout
gates). The app-UX warnings come from three places:

- **`pattern-a11y`** (`gate:patterns`, also folded into `gate:a11y`):
  - **Keyboard-operable custom widgets** — flags the `<div onClick>`
    anti-pattern: an element with an inline click handler that isn't a native
    interactive element and lacks `role` + `tabindex≥0` + a key handler. (Only
    *inline* `onclick` is visible in the DOM; framework handlers attached via
    `addEventListener` are invisible to any DOM scanner — catch those with an
    ESLint markup rule, e.g. `jsx-a11y/no-static-element-interactions` /
    `click-events-have-key-events`.)
  - **Live region for async** — toast/notification-like containers present but
    no `[aria-live]` / `[role=status|alert|log]` / `<output>` declared in the
    DOM, so async results would never be announced.
  - **Pattern conformance** — required ARIA states for `tablist`/`tab`,
    `menu`/`menubar`, `combobox`, and `switch` (see the table above). This
    checks the *markup shape* of the contract; full keyboard *navigation*
    (roving tabindex, arrow keys, type-ahead) is a manual SR spot-check.
- **`overlay-a11y`** (extended): open modals now also warn on a **missing
  accessible name** and on a **focus trap that doesn't actually trap** — the
  gate drives real `Tab` presses and checks focus can't escape the open modal
  (behavior, not a self-reported flag).
- **`inp`** (extended): **un-debounced high-frequency inline handlers**
  (`oninput`/`onscroll`/`onmousemove`/…) and **unvirtualized long lists**
  (> ~200 row-like children, `CILA_LONG_LIST`; `content-visibility` counts as
  mitigation).

### Reviewer responsibility — "no dead-end states"

The state matrix — every data view should design its **empty / loading / error
/ partial** states, not just the ideal one (NN/g; see `docs/RESEARCH-APP-UX.md`
§3) — is **review-enforced, not auto-gated**. There is no reliable, non-brittle
way to detect a *missing* empty/error state from the rendered DOM (absence isn't
observable, and any heuristic would false-positive constantly). So this stays a
human gate: it lives in **`ACCEPTANCE.md`** as explicit criteria, and a reviewer
confirms each key screen handles its full state set before sign-off. The gates
deliberately do **not** try to auto-detect it.

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
| `npm run gate:a11y` | axe-core a11y spec **+ overlay-a11y (warn) + pattern-a11y (warn)** |
| `npm run gate:patterns` | pattern-a11y spec alone (**warn**) — keyboard widgets, live regions, ARIA pattern states |
| `npm run gate:schema` | JSON-LD structured-data presence spec (**warn**) |
| `npm run gate:inp` | INP/responsiveness hygiene checklist spec (**warn**) — includes high-frequency-handler + unvirtualized-list heuristics |
| `npm run gate:motion` | reduced-motion fallback spec (HARD) |
| `npm run gate:visual` | visual-regression spec — **not in the aggregate `gate`**; needs seeded baselines (see below) |
| `npm run gate:visual:update` | seed / refresh visual baselines (review the diffs!) |
| `npm run gate:lh` | Lighthouse CI, **strict** profile (`lhci autorun --config=lighthouserc.cjs`) |
| `npm run gate:lh:showcase` | Lighthouse CI, **relaxed-perf** showcase profile — hero/marketing pages only |
| `npm run gate:perf` | INP checklist (`gate:inp`) → Lighthouse CWV (`gate:lh`) |
| `npm run gate:structural` | tokens + layout + a11y + motion (all HARD gates) |
| `npm run gate` | structural → schema → perf (INP checklist + Lighthouse), in order (**`gate:visual` excluded** so a fresh repo isn't blocked on missing baselines) |
| `npm run gate:report` | open the Playwright HTML report |

> **`gate:visual` is intentionally not part of the aggregate `npm run gate`.**
> Visual regression needs baseline screenshots, which a fresh repo doesn't have
> — running it there fails on "missing snapshot". Seed baselines once with
> `npm run gate:visual:update` (and review them — they're the accept/reject
> memory of the critique loop), then run `npm run gate:visual` as a separate
> advisory check in CI.

First-time setup in the target repo:

```bash
npm install
npx playwright install --with-deps chromium   # gate runner browser
npm run gate:visual:update                     # seed visual baselines (review them!)
```

## Configuration (env)

| Var | Default | Purpose |
|-----|---------|---------|
| `BASE_URL` | `http://localhost:4321` | Site under test. **Astro:** `http://localhost:4321`. **Next.js:** `http://localhost:3000`. Used by both `playwright.config.ts` and the Lighthouse `.cjs` configs. |
| `CILA_WEBSERVER_CMD` | `npm run preview` | Command Playwright + lhci run to boot the site. **Astro:** `npm run preview`. **Next.js:** `npm run start` (Next serves the production build with `start`, **not** `preview`). |
| `PLAYWRIGHT_NO_WEBSERVER` | _unset_ | Set when CI already started the server; neither Playwright nor lhci boots its own. |
| `CILA_ROUTES` | `/` | Comma-separated routes the Playwright specs gate, e.g. `"/,/about,/pricing"`. |
| `CILA_LH_URLS` | `${BASE_URL}/` | Comma-separated **absolute URLs** Lighthouse audits (it wants full origins, not paths). |
| `CILA_GRID` | `4` | Margin spacing-grid base in px. |
| `CILA_PADDING_GRID` | `2` | Padding/gap sub-grid base in px (allows Tailwind half-steps). Set to `4` to forbid half-steps. |
| `CILA_COLOR_TOL` | `3` | Per-channel sRGB tolerance for on-token color membership — absorbs the 1–2/255 drift an opacity modifier's oklab→sRGB mix introduces. |
| `CILA_LONG_LIST` | `200` | Row-count threshold above which an unvirtualized list/table/grid **warns** in the `inp` gate. |

Lighthouse can't read env from a JSON config, so `lighthouserc.cjs` /
`lighthouserc.showcase.cjs` are JS configs that read `BASE_URL`,
`CILA_LH_URLS`, `CILA_WEBSERVER_CMD` and `PLAYWRIGHT_NO_WEBSERVER` at load time.
`playwright.config.ts` reads the same vars for its `webServer`.

## How `/cila:go` wires these in

1. Copies `gates/playwright/`, `playwright.config.ts`, `lighthouserc.cjs`,
   `lighthouserc.showcase.cjs`, `stylelint.config.mjs` into the target repo
   (config at root, specs under a gated test dir).
2. Merges the `devDependencies` and `gate:*` scripts from this `package.json`
   into the repo's `package.json`.
3. Detects the stack and sets `BASE_URL` / `CILA_WEBSERVER_CMD` per stack — both
   `playwright.config.ts` and the Lighthouse `.cjs` configs are env-driven, so
   this is the single switch:
   - **Astro:** `BASE_URL=http://localhost:4321`, `CILA_WEBSERVER_CMD="npm run preview"`.
   - **Next.js:** `BASE_URL=http://localhost:3000`, `CILA_WEBSERVER_CMD="npm run start"`
     — Next serves the production build with `start`, **not** `preview`.
4. Adds `npm run gate:structural` (tokens + layout + a11y + **motion**) to the
   repo's CI as a **required** check and to cila's `Stop` / `SubagentStop` hook,
   so the build loop can't declare "done" while a structural gate is red.
   `gate:visual` + `gate:lh` run as advisory / budget checks. Pages with an
   intentional showcase hero swap `gate:lh` → `gate:lh:showcase` for those
   routes only (perf budget relaxes; a11y / reduced-motion / layout / tokens do
   not — see **Wow vs gates**).
