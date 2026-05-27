# cila — Architecture

The target design. See [`ROADMAP.md`](ROADMAP.md) for what's built when.

## Form factor

`cila` is a **Claude Code plugin** (the only container that bundles commands + subagents + skills + hooks + MCP config in one installable, versioned, shareable unit). Authored as its own git repo (`~/proj/cila`), distributed via a local marketplace synced through `~/dotty`, so every machine on the fleet gets it; installable anywhere via `gh`/URL.

## Two-tier model

**Tier 1 — the plugin (central, always-on).** The reusable brains. Lives once, fleet-synced.

```
cila/
├── .claude-plugin/
│   ├── plugin.json          # manifest (+ dependencies: frontend-design)
│   └── marketplace.json     # local marketplace entry → installable
├── commands/
│   ├── cila-design.md        # /cila:design  — collaborative aesthetic direction → locked DESIGN.md
│   ├── cila-init.md          # /cila:init    — materialize per-repo artifacts
│   └── cila-review.md        # /cila:review  — run the visual-critique loop on demand
├── agents/
│   ├── design-director.md    # proposes N distinct directions, decides WITH the user
│   ├── design-reviewer.md    # evaluator: drives Playwright MCP, screenshots, critiques (never self-grades)
│   └── a11y-auditor.md        # WCAG 2.2 AA gate
├── skills/
│   ├── design-tokens/        # OKLCH token system authoring (Tailwind v4 @theme, one --brand-hue)
│   ├── reference-extract/    # brandmd/design-extract — decompose a reference into tokens
│   ├── motion/               # Motion (motion/react) snippets + reduced-motion guardrails
│   └── frontend-aesthetics/  # cila's aesthetic-family presets (extends the official skill)
├── hooks/
│   └── hooks.json            # SessionStart (load taste profile) ; Stop/SubagentStop (production gate)
├── .mcp.json                 # shadcn(+registries), playwright ; chrome-devtools/figma lazy
├── templates/                # DESIGN.md · tokens.css · CLAUDE-fragment · gates/ · astro-starter/ · next-starter/
└── bin/cila-run              # headless `claude -p` loop for unattended/CI runs
```

**Tier 2 — per-repo (materialized by `/cila:init`).** Some things must live in the target repo:

```
your-site/
├── DESIGN.md                 # the locked design contract (tokens, type, motion, brand)
├── src/styles/tokens.css     # Tailwind v4 @theme, OKLCH, single --brand-hue
├── components.json           # shadcn + namespaced registries wired
├── CLAUDE.md                 # pins aesthetic + registry lanes + WCAG/perf rules + "this repo is cila-enabled"
└── (axe · lighthouse-ci · token-conformance · layout-invariant · design-lint configs)
```

## "Point any agent at it" — three paths

1. **Already global** — plugin syncs via dotty; every repo has `/cila:*` + the subagents + MCP config.
2. **Bootstrap a fresh repo** — `/cila:init` inspects the repo, picks Astro vs Next, drops in tokens/DESIGN.md/gates, and writes a pointer into that repo's `CLAUDE.md` so the next agent self-discovers the rig.
3. **Foreign machine** — `git`/URL install of the marketplace.

## The build loop

```
/cila:design ──> design-director proposes 3–5 DISTINCT directions (verbalized sampling)
                 → decide WITH the user → write locked DESIGN.md + tokens.css
        │
        ▼
   Planner ──> features.json (binary `passes`) + plan          [file-mediated handoff]
        │
        ▼
   Generator ──> builds from DESIGN.md + shadcn MCP (free premium registries)
        │           one feature at a time
        ▼
   design-reviewer (evaluator subagent, own context) ──> Playwright MCP:
        screenshot matrix (360/768/1024/1440 × light/dark × hover/focus/empty/error)
        → render-health gate (invalid render = reject)
        → critique vs DESIGN.md (Design/Originality/Craft/Functionality)
        → pivot-or-refine ; accept only on strictly-better score
        │
        ▼
   Production gates (hard, derived from DESIGN.md/DTCG):
        axe-core (WCAG 2.2 AA) · token conformance (computed-style) · layout invariants
        · Lighthouse CI budgets · design-lint · Playwright visual regression
        │
        ▼
   Human gate on taste-sensitive calls → ship
```

Key invariants:
- **Generator never grades its own work** — the evaluator is a separate subagent.
- **Heavy MCPs (Playwright, Chrome DevTools) live in the evaluator's context**, not the lead's — the biggest token-budget lever.
- **Rules-based checks before visual before LLM-judge** — cheapest/strongest first; the LLM judge is advisory and never overrides a hard structural fail.
- **The gates are derived from the token contract** — the test suite *is* the design system.

## Composition (don't reinvent)

Depend on / wire in, with attribution:
- `frontend-design` (official) — design judgment. **Depend via `plugin.json` `dependencies`, don't fork.**
- OneRedOak `claude-code-workflows` design-review — the evaluator subagent + `/design-review` + PR action (adapt).
- Vercel `web-interface-guidelines` — the 100-rule craft audit (skill).
- `Community-Access/accessibility-agents` — WCAG agents (a11y gate).
- shadcn MCP + free registries; Playwright MCP; `design-extract`/`brandmd`; `colorjs.io`; Fontsource; Iconify MCP.

## Default stacks

- **Marketing/landing:** Astro + Tailwind v4 + Cloudflare Pages.
- **App/dashboard:** Next.js (App Router) + Tailwind v4 + Vercel.
- Tokens: OKLCH via tweakcn. Fonts: Fontshare self-hosted via Fontsource. Motion: `motion/react`.

## Cost posture

100% free stack by default. The only recurring cost is Claude plan quota; the visual loop is heavier (vision tokens ~3x). Mitigations: cap screenshots/cycle, `/cila:review` on demand (not every edit), N=3 for best-of-N, reserve multi-judge panels for tie-breaks. Pro component tiers (Aceternity/Magic UI Pro ~$199) and Chromatic/Figma remain optional, never required.
