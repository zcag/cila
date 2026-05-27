# cila — Decisions

Locked decisions and rationale. Append-only; supersede with a dated note rather than deleting.

- **[name]** Called **cila** (Turkish: *polish/gloss*) — short, types well as a command prefix (`/cila:design`), names exactly what it does (the craft/polish layer over raw components).
- **[form]** A **Claude Code plugin**, not a starter template — the only container that bundles commands + subagents + skills + hooks + MCP config as one installable, portable unit. Satisfies the "point any agent at it from anywhere" requirement. Per-repo template lives in `templates/` and is materialized by `/cila:init`.
- **[approach]** **Composition, not from-scratch.** ~80% existing OSS (frontend-design, OneRedOak design-review, Vercel guidelines, accessibility-agents, shadcn MCP, Playwright MCP, design-extract). cila adds only the ~20% missing: collaborative design step, locked token contract, per-repo materialization, glue. Depend on `frontend-design` via `plugin.json` `dependencies` — do not fork it.
- **[cost]** **100% free stack by default.** Component *components* (Aceternity/Magic UI/Origin/Cult/etc.) are free/MIT; only their **Pro template bundles** (~$199) are paid and never required. Chromatic and Figma seats are optional. The one real recurring cost is Claude plan quota (visual loop ≈ 3x vision tokens) — mitigated by capping screenshots/cycle and on-demand review.
- **[location]** Authored in `~/proj/cila` (matches the `~/proj/claude-skills` pattern); distributed via a local marketplace synced through `~/dotty` so the fleet (marko/bender/archer) gets it. GitHub repo **private**.
- **[stacks]** Astro + Tailwind v4 + Cloudflare Pages for marketing (Astro-first); Next.js + Tailwind v4 + Vercel for apps. Tokens OKLCH via tweakcn; fonts self-hosted via Fontsource defaulting to Fontshare faces; motion via `motion/react` (not Webflow-owned GSAP for generated output).
- **[phasing]** Ship **Phase 1 (lean core)** first; Phases 2 (compounding) and 3 (scale & wow) are opt-in upgrades. Keep Phase 1 short/dense/readable — no over-engineering.
- **[gates]** Acceptance = green hard gates + screen-reader spot-check, **never** "the screenshot looks good." LLM/perceptual judge is advisory and runs only after structural gates pass. Build to WCAG 2.2 AA (3.0 is a draft, ~2029).
- **[review-loop]** The **generator never grades its own output** — a separate evaluator subagent does, with Playwright MCP isolated in its own context window.
