# cila production gates

A lean, drop-in quality gate suite for a cila-enabled website. `/cila:go` copies
this `gates/` tree into the target repo and wires the scripts into its
`package.json` and CI.

The gates are **derived from the design contract** (`DESIGN.md` +
`src/styles/tokens.css`): the color allow-set is read at runtime from the
resolved CSS custom properties on `:root`, so *the test suite is the design
system*. Nothing here is hardcoded to a specific site.

These are guardrails, not a cage — they assert genuine production facts
(accessibility, on-token color, a reduced-motion fallback, performance budgets)
and otherwise stay out of the way of intentional design and rich motion.

## The gates

| Gate | File | Checks |
|------|------|--------|
| **a11y** | `playwright/a11y.spec.ts` | `@axe-core/playwright` (WCAG `wcag2a/aa`, `wcag21a/aa`, `wcag22aa`), run post-render across the 360/768/1024/1440 viewport matrix. Full JSON attached to the report; zero violations required. |
| **tokens** | `playwright/token-conformance.spec.ts` | Every visible element's computed `color` / `background-color` / `border-color` is a member of the allow-set resolved from `:root` custom props. Membership is **alpha-agnostic** (Tailwind opacity modifiers like `bg-brand/35` are permitted). Catches hardcoded `#3b82f6` and Tailwind arbitrary values that survive the build. |
| **tokens (lint)** | `stylelint.config.mjs` | Cheap static source guard: bans raw hex / `rgb()` / `hsl()` / `oklch()` / `color()` / `lab()` / `lch()` / named colors in hand-authored CSS, forcing color/shadow props through `var(--token)`. The token-definition layer (`tokens.css`/`theme.css`) is exempt. |
| **motion** | `playwright/reduced-motion.spec.ts` | Under `prefers-reduced-motion: reduce`, non-essential motion must be **guarded**: either the page is static (no continuous `requestAnimationFrame` loop) **or** a visible `[data-reduced-fallback]` substitute exists. Measures real rAF activity in-page. It does **not** police *which* CSS properties you animate — animating width/height/`transition:all`/non-composited props is a design choice, not gated here. |
| **lh** | `lighthouserc.cjs` | Lighthouse CI core-web-vitals / performance budget (LCP, CLS, TBT, scores). |
| **lh (showcase)** | `lighthouserc.showcase.cjs` | Relaxed **performance** budget for designated hero/marketing routes only. Accessibility/layout assertions stay strict. Point its `url` at the hero route(s) and use sparingly. |

## npm scripts

| Script | Runs |
|--------|------|
| `npm run gate:tokens` | token-conformance spec + stylelint |
| `npm run gate:a11y` | axe-core a11y spec |
| `npm run gate:motion` | reduced-motion fallback spec |
| `npm run gate:lh` | Lighthouse CI, **strict** profile |
| `npm run gate:lh:showcase` | Lighthouse CI, **relaxed-perf** showcase profile (hero pages only) |
| `npm run gate:structural` | tokens + a11y + motion (the Playwright/stylelint gates) |
| `npm run gate` | **the full suite**: `gate:structural` → `gate:lh` |
| `npm run gate:report` | open the Playwright HTML report |

First-time setup in the target repo:

```bash
npm install
npx playwright install --with-deps chromium   # gate runner browser
```

## Configuration (env)

| Var | Default | Purpose |
|-----|---------|---------|
| `BASE_URL` | `http://localhost:4321` | Site under test. **Astro:** `:4321`. **Next.js:** `:3000`. Used by `playwright.config.ts` and the Lighthouse configs. |
| `CILA_WEBSERVER_CMD` | `npm run preview` | Command to boot the site. **Astro:** `npm run preview`. **Next.js:** `npm run start`. |
| `PLAYWRIGHT_NO_WEBSERVER` | _unset_ | Set when CI already started the server; neither Playwright nor lhci boots its own. |
| `CILA_ROUTES` | `/` | Comma-separated routes the Playwright specs gate, e.g. `"/,/about,/pricing"`. |
| `CILA_LH_URLS` | `${BASE_URL}/` | Comma-separated **absolute URLs** Lighthouse audits. |
| `CILA_COLOR_TOL` | `3` | Per-channel sRGB tolerance for on-token color membership. |

Lighthouse can't read env from a JSON config, so `lighthouserc.cjs` /
`lighthouserc.showcase.cjs` are JS configs that read `BASE_URL`, `CILA_LH_URLS`,
`CILA_WEBSERVER_CMD` and `PLAYWRIGHT_NO_WEBSERVER` at load time.

## How `/cila:go` wires these in

1. Copies `gates/playwright/`, `playwright.config.ts`, `lighthouserc.cjs`,
   `lighthouserc.showcase.cjs`, `stylelint.config.mjs` into the target repo.
2. Merges the `devDependencies` and `gate:*` scripts into the repo's
   `package.json`.
3. Sets `BASE_URL` / `CILA_WEBSERVER_CMD` per detected stack (Astro vs Next.js).
4. Adds `npm run gate` to CI as a required check. Pages with an intentional
   showcase hero swap `gate:lh` → `gate:lh:showcase` for those routes only (perf
   budget relaxes; a11y / reduced-motion / tokens do not).
