# Changelog

Versioning is **pinned**: each release bumps `version` in `.claude-plugin/plugin.json` and is tagged `cila--v<version>`. Users update with `/plugin marketplace update cila-marketplace` → `/plugin update cila@cila-marketplace` → `/reload-plugins`, and verify with `/plugin list` (should show this version).

## 0.2.2 — 2026-05-27

- **Fix (wow-by-default):** cila had the wow stack since 0.1.x but *under-applied* it — the default was timid editorial (confirmed on a live build). Striking is now the **floor**: design-director defaults to a bold direction with **at least one signature moment** (more if earned) and, for hero-led marketing, **shows the product**, not just tells; the `wow` skill engages **by default** for hero builds (opt out for deliberately minimal); design-reviewer gains an **Impact/wow axis** that fails the timid modes (no signature moment, no hero visual, washed-out contrast, same-weight repetitive sections — "clean but forgettable" no longer passes).

## 0.2.1 — 2026-05-27

- **Fix (process, from live testing):** `/cila:go` now works in **reviewable chunks with feedback rounds**, not one ~hour-long monolithic build. Added a **first-cut checkpoint** (build the hero + one section / the app shell + one screen, render it, get a vibe/ideas feedback round *before* building the rest), a standing "checkpoint — don't disappear" rule, and a **budget/pace** default: best-of-N, 3D/shader wow, trajectory judging, and exhaustive polish are flagship-depth — opt-in, never auto-bundled into one casual command.

## 0.2.0 — 2026-05-27

**App-UX layer** — cila now treats application/interface design (dashboards, tools, product UIs) as a first-class discipline, not just marketing sites.

- `/cila:go` **branches on project type** (Stage 0): marketing/content site → `content-strategist` (`CONTENT.md`); application → **`ux-architect` → `UX.md`** (IA · navigation + app shell · route map · key-screens × their state set · flows · dashboard). `design-director` then does the look (apps = density / Refactoring-UI craft).
- New **`ux-architect`** subagent + **`UX.md`** contract; new skills **`app-ux`** (Nielsen / Norman / Laws of UX / Refactoring-UI + IA/nav/shell/dashboards + heuristic-eval), **`ux-states`** (full state matrix + forms + data display + "no dead-end states"), **`a11y-patterns`** (WAI-ARIA APG component contracts + headless ecosystem + app-a11y-beyond-axe).
- New **app gates** (warn-level): keyboard-operable widgets · live-region-for-async · ARIA pattern conformance · behavioral focus-trap · INP heuristics. "No dead-end states" is reviewer-enforced via `ACCEPTANCE.md`.
- **Next starter is now an app shell** (sidebar + ⌘K + data table with all states + accessible form + dashboard), build-verified. Astro stays the marketing starter.
- Research archived: `docs/RESEARCH-APP-UX.md`.

## 0.1.2 — 2026-05-27

- **Fix (UX):** the direction step no longer asks the user to pick between aesthetic-jargon labels ("Terminal-luxe", "Swiss canvas") they can't visualize. `design-director` now leads with **plain, reference-anchored** descriptions ("calm & editorial, like a magazine"; "dark & precise, like Linear"), **offers to show** the options (reference screenshots via `inspiration`, or quick hero mockups via `explore`), always **recommends one**, and lets an unsure user say "you pick" and react to something rendered. No design vocabulary required.

## 0.1.1 — 2026-05-27

- **Fix (install-breaking):** removed the hard `frontend-design` dependency. Declared cross-marketplace, it resolved to `frontend-design@cila-marketplace` (wrong marketplace) and errored on install. frontend-design is **pre-installed by default** (pre-configured `claude-plugins-official` marketplace) and its rules are inlined in cila's prompts — so it's now a **recommended companion, not a dependency**. Also dropped the now-unneeded `allowCrossMarketplaceDependenciesOn` from the marketplace manifest.

## 0.1.0 — 2026-05-27

First public release. cila covers all three legs of web design — **content + visual + production**.

- **Orchestrator** — `/cila:go` staged contract (content-first: assess → direction → materialize → build → review), `.cila/state.json` + append-only `progress.md` (read-before-act), `Stop`/`SubagentStop` gate hook.
- **Subagents** — content-strategist · design-director · design-reviewer (evidence-grounded + trajectory judging, bias hygiene) · design-explorer · a11y-auditor.
- **Content layer** — positioning / JTBD / StoryBrand / conversion copywriting + the anti-slop kill-list (`content-structure`, `copywriting`, `voice`; `CONTENT.md` contract).
- **Visual + wow** — OKLCH design tokens, aesthetics, motion, reference-extract, inspiration, icons; wow tier (`r3f`, `shaders`, `hero-art`, `3d-assets`, `view-transitions`) + build-verified `templates/wow` library.
- **Production gates** — computed-style token conformance, spacing/type, layout invariants, axe WCAG 2.2 AA, reduced-motion, Lighthouse budgets, + warn-gates (`inp`, `schema`, `overlay-a11y`); `ACCEPTANCE.md` contract.
- **Best-of-N** — parallel git-worktree explorers + diversity-preserving pairwise-Elo selection (`explore`).
- **Starters** — build-verified Astro + Next (Tailwind v4, OKLCH tokens, View Transitions, scroll-driven CSS, speculation rules).
- **Self-improvement (build-time)** — `cila-Bench` (pairwise-Elo on cila's own output) + `taste` skill (learns from your edits).
- **Scope** — build-time only (no deployment/analytics/live-experiment coupling). Free & keyless by default; opt-in paid extras documented.
