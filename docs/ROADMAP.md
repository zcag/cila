# cila — Roadmap

Staged so the lean core ships first and stays short/dense/readable. Phase 1 is the product; 2 and 3 are upgrades added only when a real project demands them.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## Phase 0 — Repo & docs  `[~]`

- [x] Create repo `~/proj/cila`, git init
- [x] Research archive (`docs/RESEARCH.md`)
- [x] Architecture (`docs/ARCHITECTURE.md`), roadmap, decisions
- [ ] Private GitHub repo + push
- [ ] Local marketplace wiring validated (install cila into a scratch repo)

---

## Phase 1 — Lean core (the product)

Mostly config + prompts. 100% free. Goal: a genuinely great rig that takes a project from aesthetic direction → gorgeous, gated, shipped page.

**Plugin skeleton**
- [ ] `plugin.json` manifest (+ `dependencies: frontend-design`, `version`, `userConfig` for viewports/perf budgets)
- [ ] `marketplace.json` (installable)
- [ ] `.mcp.json` — shadcn (+ `@magicui @aceternity @origin @cult @kokonutui @tailark @reactbits`), playwright

**Collaborative design**
- [ ] `/cila:design` command + `design-director` subagent — verbalized sampling (propose 3–5 distinct directions w/ rationale), decide *with* the user, write locked `DESIGN.md`
- [ ] `templates/DESIGN.md` (tokens, type, motion, brand-origin, 9-section structure)
- [ ] `skills/design-tokens` — OKLCH, Tailwind v4 `@theme`, single `--brand-hue`; tweakcn integration
- [ ] `skills/reference-extract` — decompose a reference (brandmd/design-extract) into tokens

**Build + visual loop**
- [ ] `agents/design-reviewer` (evaluator) — Playwright MCP in its own context; screenshot matrix (360/768/1024/1440 × light/dark × states); render-health gate; critique vs DESIGN.md; pivot-or-refine; strictly-better acceptance
- [ ] `/cila:review` command
- [ ] `skills/motion` — Motion (`motion/react`) snippets + `prefers-reduced-motion` guardrails
- [ ] `skills/frontend-aesthetics` — cila aesthetic-family presets (from awesome-claude-design), extends official skill

**Production gates (derived from DESIGN.md)**
- [ ] `agents/a11y-auditor` + axe-core (WCAG 2.2 AA tags)
- [ ] Token-conformance check (computed-style vs `:root` tokens)
- [ ] Layout-invariant checks (no h-scroll, overflow, overlap, touch targets) across viewport matrix
- [ ] Lighthouse CI budgets
- [ ] design-lint (token/component drift)
- [ ] Playwright visual regression (masked, animations disabled)
- [ ] `hooks/hooks.json` — `Stop`/`SubagentStop` gate before "done"

**Materialization**
- [ ] `/cila:init` — inspect repo, pick Astro vs Next, drop tokens/DESIGN.md/gates/components.json + CLAUDE.md pointer
- [ ] `templates/astro-starter` (first), `templates/next-starter` (when first app needs it)
- [ ] `templates/gates/` configs
- [ ] Visual-asset wiring: Fontsource/Fontshare, Iconify MCP, Pexels/sharp, React Bits backgrounds

**Validation**
- [ ] Take a real landing page through `/cila:design` → build → `/cila:review` → gates

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
