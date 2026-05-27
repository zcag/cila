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
- [x] **`skills/go` orchestrator** — the single front door `/cila:go` (model-invocable; auto-detects state, delegates to subagents). The separate `design|init|review` commands were consolidated into it. Now a **staged contract** (ordered stages + exit criteria; never-skip / never-done-on-failing-gate; `.cila/state.json` progress).

**Collaborative design**
- [x] `design-director` subagent — verbalized sampling, decide the look *with* the user, write locked `DESIGN.md` (invoked by `/cila:go`)
- [x] `templates/DESIGN.md` (aesthetic direction, negative constraints, tokens, type, motion, components)
- [x] `skills/design-tokens` — OKLCH, Tailwind v4 `@theme`, single `--brand-hue`; tweakcn seeding
- [x] `skills/reference-extract` — decompose a reference (brandmd/design-extract) into tokens

**Build + visual loop**
- [x] `agents/design-reviewer` (evaluator) — Playwright MCP; screenshot matrix; render-health gate; critique vs DESIGN.md; pivot-or-refine; strictly-better acceptance
- [x] review step (folded into `/cila:go`; delegates to `design-reviewer`)
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
- [x] `hooks/hooks.json` — SessionStart contract announcement + **`Stop`-gate hook** (`hooks/stop-gate.sh`): blocks declaring done while `.cila/state.json` flags ungated UI changes

**Materialization**
- [x] materialize step (folded into `/cila:go`) — inspect repo, scaffold-or-overlay, drop tokens/gates/components.json + CLAUDE.md pointer
- [x] `templates/astro-starter` + `templates/next-starter` — both build-verified, identical OKLCH token contract (marketing vs app)
- [x] `templates/gates/` configs
- [x] Visual-asset wiring — Fontsource fonts ✓ · icons via Iconify API + npm sets (`skills/icons`) ✓ · Pexels+sharp (`skills/hero-art`) ✓ · animated backgrounds (`templates/wow` + React Bits) ✓
- [x] brownfield adopt — auto-detected inside `/cila:go` (no flag): capture an existing app's design into `DESIGN.md` without restyling it

**Validation**
- [ ] Install cila (local marketplace) and take a real landing page through `/cila:design` → build → `/cila:review` → gates

---

## Phase 1.5 — Creativity & wow (prioritized)

Most creative lift is cheap; the visual ceiling ("jaw-dropping") is the priority.

- [x] `skills/wow` — the jaw-dropping playbook (concept-first, the menu, tiers, guardrails)
- [x] `skills/r3f` — React Three Fiber production patterns (perf, damping, reduced-motion)
- [x] `skills/shaders` — GLSL background recipes (gradient/fbm/domain-warp/grain)
- [x] Showcase gate profile (`lighthouserc.showcase.json`) + `reduced-motion.spec.ts` hard gate — flex perf for heavy heroes, keep a11y/reduced-motion/layout/tokens strict
- [x] `templates/wow/` — build-verified reference components (Tier 1 CSS mesh/grain/scroll · Tier 2 R3F shader+3D · orchestrated motion); all honor reduced-motion + compositor-only + brand tokens
- [x] design-director anchors on award-tier references + proposes a wow direction; Steel-driven retrieval wired via `skills/inspiration`
- [x] AI hero-art (`skills/hero-art`) — opt-in image-gen MCP wiring (Nano Banana / fal / Replicate) + `sharp` responsive pipeline + LCP/a11y rules; user supplies the key (keyless fallback = shaders/CSS/3D + Pexels)
- [ ] Light "explore-then-pick": render top-2 hero concepts before committing

---

## Content track — Messaging & copy (core: the third leg of web design)

Researched in `docs/RESEARCH-CONTENT.md` (positioning · conversion copy · voice/anti-slop · IA/narrative/SEO).

- [x] `CONTENT.md` contract template (positioning · core message · voice chart · page/section plan · VoC)
- [x] `content-strategist` subagent — strategy → `CONTENT.md`, collaborates on the "angle"
- [x] `copywriting` skill — PAS/AIDA/BAB/FAB, page anatomy by type, headline/CTA craft, conversion checklist, Desire−(Labor+Confusion)
- [x] `voice` skill — Voice Chart, anti-slop kill-list + counters, microcopy, separate editor pass
- [x] `content-structure` skill — StoryBrand, IA, scannability, content-first handoff, SEO (2026 flags), a11y convergence
- [x] Content-first wiring: `/cila:go` does message→look; build writes real copy; design-director consumes `CONTENT.md`; design-reviewer critiques copy

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

- [x] Best-of-N: parallel git-worktree explorer subagents → pairwise Elo tournament → human picks (`explore` skill + `design-explorer` subagent + design-reviewer pairwise mode)
- [x] DPP/max-min diverse-subset selection (in `explore`) + multi-judge tie-break panel (in `design-reviewer`)
- [x] CWV hard gate via Lighthouse CI (default + showcase profiles); Chrome DevTools MCP documented opt-in for interaction-driven INP/trace profiling (`docs/INTEGRATIONS.md`)
- [—] Headless `cila-run` + PR design-review Action — **cut** (user opted out of headless/automation)
- [x] Inspiration retrieval (`skills/inspiration`): Steel-driven galleries (free, default) + Mobbin MCP (opt-in) + WebSight/Vision2UI datasets
- [x] Heavier wow: AI hero-art (`skills/hero-art`) + 3D asset pipelines (`skills/3d-assets` — Poly Haven CC0 / poly.pizza) *(best-of-N done — `explore`; `r3f`/`shaders` + components in Phase 1.5)*
- [x] Figma Dev Mode MCP + Code-to-Canvas — documented opt-in (`docs/INTEGRATIONS.md`)
- [x] v0 Platform API — documented opt-in explorer backend for best-of-N (`docs/INTEGRATIONS.md`)

---

## Guardrails

- **No over-engineering.** Phase 1 must stay legible. Add 2/3 items only when a project pulls for them.
- **Compose, don't reinvent.** Prefer depending on existing OSS over rebuilding.
- **Gates can't be charmed.** A pretty screenshot never passes a hard structural fail.

---

## Audit closeout

A two-agent review (prompt architecture + code/templates) was run, triaged, and fixed. Status:
- [x] Touch-target: gate honors WCAG 2.5.8 exceptions (inline / focus-enlarge / spacing — browser-verified) + starters bumped nav hit-areas ≥24px.
- [x] stylelint nits fixed in both starters' global CSS (import-notation, vendor-prefix, comment spacing) — lint clean.
- [ ] cross-marketplace `frontend-design` dependency resolution (needs the official plugin's release tags) — verify on a real install; it's pre-installed by default so usually moot.

---

## Frontier directions — see `docs/RESEARCH-FRONTIER.md`

Net-new directions beyond the core. Keystone = **build-time measurement**. **cila is build-time only — no deployed-state / analytics / live-experiment work** (`[scope]` in DECISIONS). **A, B, and D are now BUILT; C remains.**

- ✅ **A — Measurable & self-improving (the moat, build-time):** `cila-Bench` (pairwise Elo scoreboard) + cross-family judge + human holdout; GEPA prompt-evolution; CIPHER diff→preference (self-writing taste, from your edits); curated example bank. *(No production/conversion signal — dev-time only.)*
- ✅ **B — Frontier web (cheap, anytime):** View Transitions, scroll-driven CSS default, Speculation Rules, INP gate, popover/dialog/invoker + anchor positioning (a11y + dep removal), `text-wrap: balance/pretty`, WebGPU+TSL, AEO/GEO content. (Skip `llms.txt`.)
- ◻ **C — Build-time scaling (NOT deployed-state, remaining):** programmatic/full-site pages + design-system governance; i18n; redesign-audit. *(Analytics instrumentation, live A/B/CRO, RUM, conversion writeback = OUT OF SCOPE.)*
- ✅ **D — Harden the harness:** evidence/rubric-grounded + trajectory judging; verification-first frozen `ACCEPTANCE.md`; durable `.cila/progress.md` (read-before-act); diversity-preserving best-of-N; externally-gated bounded reflexion; skill routing + cost tiers at scale.
