# Changelog

Versioning is **pinned**: each release bumps `version` in `.claude-plugin/plugin.json` and is tagged `cila--v<version>`. Users update with `/plugin marketplace update cila-marketplace` → `/plugin update cila@cila-marketplace` → `/reload-plugins`, and verify with `/plugin list` (should show this version).

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
