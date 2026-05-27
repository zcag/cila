# cila — Roadmap

Staged so the lean core ships first and stays short/dense/readable. Phase 1 is the product; 2 and 3 are upgrades added only when a real project demands them.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## Phase 0 — Repo & docs  `[x]`

- [x] Create repo `~/proj/cila`, git init
- [x] Research archive (`docs/RESEARCH.md`)
- [x] Architecture (`docs/ARCHITECTURE.md`), roadmap, decisions
- [x] Private GitHub repo + push (`zcag/cila`)
- [ ] Local marketplace wiring validated (install cila into a scratch repo) → see Phase 1 Validation

---

## Phase 1 — Lean core (the product)

Mostly config + prompts. 100% free. Goal: a genuinely great rig that takes a project from aesthetic direction → gorgeous, gated, shipped page.

**Plugin skeleton**
- [x] `plugin.json` manifest  *(basic; `dependencies: frontend-design` + `userConfig` deferred to install-validation)*
- [x] `marketplace.json` (installable)
- [x] `.mcp.json` — shadcn + playwright  *(registry list lives in the starter's `components.json`)*

**Collaborative design**
- [x] `/cila:design` command + `design-director` subagent — verbalized sampling, decide *with* the user, write locked `DESIGN.md`
- [x] `templates/DESIGN.md` (aesthetic direction, negative constraints, tokens, type, motion, components)
- [x] `skills/design-tokens` — OKLCH, Tailwind v4 `@theme`, single `--brand-hue`; tweakcn seeding
- [x] `skills/reference-extract` — decompose a reference (brandmd/design-extract) into tokens

**Build + visual loop**
- [x] `agents/design-reviewer` (evaluator) — Playwright MCP; screenshot matrix; render-health gate; critique vs DESIGN.md; pivot-or-refine; strictly-better acceptance
- [x] `/cila:review` command
- [x] `skills/motion` — Motion (`motion/react`) + `prefers-reduced-motion` + compositor-only
- [x] `skills/frontend-aesthetics` — 9 families + AI-slop fingerprint counters

**Production gates (derived from DESIGN.md)**
- [x] `agents/a11y-auditor` + axe-core (WCAG 2.2 AA tags)
- [x] Token-conformance check (computed-style vs `:root` tokens)
- [x] Layout-invariant checks (no h-scroll, overflow, overlap, touch targets) across viewport matrix
- [x] Spacing-grid + type-scale conformance
- [x] Lighthouse CI budgets (LCP/CLS/TBT + non-composited-animations)
- [x] design-lint (`stylelint.config.mjs` — bans raw hex, forces `var(--token)`)
- [x] Playwright visual regression (masked, animations disabled)
- [x] `hooks/hooks.json` — SessionStart contract announcement  *(hard `Stop`/`SubagentStop` gate deferred — relying on `/cila:review` + CI for now)*

**Materialization**
- [x] `/cila:init` — inspect repo, scaffold-or-overlay, drop tokens/DESIGN.md/gates/components.json + CLAUDE.md pointer
- [x] `templates/astro-starter` (build-verified) ; [ ] `templates/next-starter` (when first app needs it)
- [x] `templates/gates/` configs
- [~] Visual-asset wiring — Fontsource fonts in starter ✓ ; Iconify MCP / Pexels+sharp / React Bits backgrounds pending
- [ ] `/cila:init --adopt` — brownfield: capture an existing app's design into `DESIGN.md` (proposed)

**Validation**
- [ ] Install cila (local marketplace) and take a real landing page through `/cila:design` → build → `/cila:review` → gates

---

## Phase 2 — Compounding (gets better with use)

- [ ] Taste profile (`taste/*.md` in `${CLAUDE_PLUGIN_DATA}`) + SessionStart hook injection
- [ ] Approved-example few-shot bank (DESIGN.md + screenshot + why-it-worked)
- [ ] `@cila` private shadcn registry — promote winning bespoke components post-ship
- [ ] CIPHER edit-diff → inferred preference appended to taste profile
- [ ] Accept/reject log; approved screenshots become visual baselines
- [ ] DTCG token format + Style Dictionary; gates derived from resolved tokens

---

## Phase 3 — Scale & wow (opt-in)

- [ ] Best-of-N: parallel git-worktree explorer subagents → pairwise Elo tournament → human picks
- [ ] Multi-judge debate (tie-break only); DPP/max-min diverse-subset selection
- [ ] Chrome DevTools MCP — CWV (LCP/CLS/INP) as a hard gate
- [ ] `bin/cila-run` headless loop; PR design-review GitHub Action (`claude-code-action@v1`)
- [ ] Mobbin MCP + Steel-driven inspiration retrieval; WebSight/Vision2UI offline datasets
- [ ] `skills/r3f` + `skills/shaders` (R3F/drei, generative backgrounds); AI image gen MCP (Nano Banana); poly.pizza/Poly Haven assets
- [ ] Figma Dev Mode MCP + Code to Canvas (optional design source/roundtrip)
- [ ] Optional v0 Platform API as an architecturally-different generator

---

## Guardrails

- **No over-engineering.** Phase 1 must stay legible. Add 2/3 items only when a project pulls for them.
- **Compose, don't reinvent.** Prefer depending on existing OSS over rebuilding.
- **Gates can't be charmed.** A pretty screenshot never passes a hard structural fail.
