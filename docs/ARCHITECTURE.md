# cila — Architecture

The target design. See [`ROADMAP.md`](ROADMAP.md) for what's built when.

## Form factor

`cila` is a **Claude Code plugin** (the only container that bundles commands + subagents + skills + hooks + MCP config in one installable, versioned, shareable unit). Authored as its own git repo and distributed via a Claude Code marketplace — added by local path during development, or installed from the GitHub repo on any machine.

## Two-tier model

**Tier 1 — the plugin (central, always-on).** The reusable brains. Lives once, fleet-synced.

```
cila/
├── .claude-plugin/
│   ├── plugin.json          # manifest (+ dependencies: frontend-design)
│   └── marketplace.json     # local marketplace entry → installable
├── skills/
│   ├── go/                   # THE front door: /cila:go (also auto-invoked). Orchestrates everything
│   ├── content:              # content-structure · copywriting · voice
│   ├── design:               # design-tokens · frontend-aesthetics · motion · inspiration  (inspiration sources AND decomposes references)
│   ├── wow:                  # wow  (asset-led; folds in r3f/shaders/hero-art/3d-assets/view-transitions)
│   └── app:                  # app-ux  (folds in ux-states + a11y-patterns)
├── agents/                   # internal machinery the orchestrator delegates to (the user never calls these directly)
│   ├── content-strategist.md # the message/positioning — "what to say"
│   ├── design-director.md    # the aesthetic direction — "how it looks" (reads CONTENT.md; reference-anchored; names the signature moment)
│   ├── design-reviewer.md    # the single evaluator: render-health → gates → behavioral a11y → visual + copy critique → blocking Impact/wow; never self-grades
│   └── ux-architect.md       # application IA/nav/shell/flows — "how it works" (apps, not marketing)
├── hooks/
│   └── hooks.json            # SessionStart (announce DESIGN.md contract) ; Stop/SubagentStop (gate reminder)
├── .mcp.json                 # shadcn, playwright (free, keyless) ; paid/keyed integrations opt-in (see INTEGRATIONS.md)
└── templates/                # CONTENT.md · DESIGN.md · gates/ · wow/ · astro-starter/ · next-starter/
```

**Tier 2 — per-repo (materialized silently by `/cila:go`).** Some things must live in the target repo:

```
your-site/
├── DESIGN.md                 # the locked design contract (tokens, type, motion, brand)
├── src/styles/tokens.css     # Tailwind v4 @theme, OKLCH, single --brand-hue
├── components.json           # shadcn + namespaced registries wired
├── CLAUDE.md                 # pins aesthetic + registry lanes + WCAG/perf rules + "this repo is cila-enabled"
└── (axe · token-conformance · reduced-motion · lighthouse-ci · stylelint color-literal configs)
```

## "Point any agent at it" — three paths

1. **Already global** — once installed, every repo has `/cila:go` (which also auto-fires when the user describes a site to build) + the subagents + MCP config.
2. **Bootstrap a fresh repo** — `/cila:go` (or just asking for a site) silently detects state, scaffolds or adopts, and writes a pointer into the repo's `CLAUDE.md` so the next agent self-discovers the rig.
3. **Foreign machine** — `git`/URL install of the marketplace.

## The build loop

```
/cila:go ──> assess silently (new vs existing · framework · intent) — only ask about the look
        │    └─ if no DESIGN.md: design-director proposes distinct directions, ANCHORED on
        │       real references → decide WITH the user → lock DESIGN.md + tokens.css
        │       (the ONE signature moment is concretely NAMED in DESIGN.md)
        │
        ▼
   Build ──> from DESIGN.md + shadcn MCP (free premium registries); real copy, no lorem
        │       asset-led wow moment ; FIRST CUT is a hard checkpoint, then chunks
        ▼
   design-reviewer (single evaluator subagent, own context) ──> Playwright MCP:
        screenshot matrix (360/768/1024/1440 × light/dark × hover/focus/empty/error)
        → render-health gate (invalid render = reject)
        → run the 4 lean gates (below)
        → behavioral a11y checks
        → critique vs DESIGN.md (Design/Originality/Craft/Functionality)
        → blocking Impact/wow axis (returns HOLD, not a note)
        → refine until PASS
        │
        ▼
   Production gates (the 4 lean set + 1 guard, hard, derived from DESIGN.md):
        axe-core (WCAG 2.2 AA) · token conformance (computed-style)
        · reduced-motion fallback · Lighthouse CI / CWV budgets
        · stylelint color-literal guard
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

100% free stack by default. The only recurring cost is Claude plan quota; the visual loop is heavier (vision tokens ~3x). Mitigations: cap screenshots/cycle, one lean review pass (not every edit). Pro component tiers (Aceternity/Magic UI Pro ~$199) and Chromatic/Figma remain optional, never required.
