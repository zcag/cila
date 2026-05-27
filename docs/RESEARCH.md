# cila — Research Archive

Consolidated findings from six deep-research passes (2026 sources). This is the evidence base behind [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`ROADMAP.md`](ROADMAP.md). Organized by topic; each section ends with sources.

---

## 0. Core thesis

**Quality is the harness, not the model.** The same Claude Opus scores ~87% on SWE-bench in one harness vs ~91% in another — 20+ point swings come purely from scaffolding. Across every 2026 eval, AI tools nail the first-screenshot impression but fail at keyboard users, real responsiveness, performance, and maintainability, and ship insecure code by default. So "produce gorgeous + production-grade" is an architecture problem. Five levers, in impact order:

1. **Input specificity** — generic prompt → generic output (the dominant variable). Bold committed aesthetic + design system + reference decomposition + explicit *negative* constraints.
2. **A persistent design contract** the model reads every session (tokens + component rules) → no drift to the statistical mean.
3. **The agentic visual-critique loop** — separate evaluator screenshots the rendered page and critiques; never let the generator grade itself (it just praises its own work).
4. **Premium component registries** over vanilla shadcn (which reads as generic).
5. **Production gates as hard enforcement** (hooks + CI) — acceptance signal = green gates + screen-reader pass, never "looks good."

---

## 1. The `frontend-design` skill + Claude Design

**`frontend-design` skill** (official Anthropic, ~277K installs, authored Prithvi Rajasekaran & Alexander Bricken). Pure prompt engineering — a single ~40-line `SKILL.md`, no scripts/sub-files. Already installed locally via `claude-plugins-official`. Mechanics:
- Forces a **Design Thinking** pass (Purpose / Tone / Constraints / Differentiation) and commits to **one extreme tone** (brutally minimal, maximalist chaos, retro-futuristic, organic, luxury/refined, playful, editorial/magazine, brutalist/raw, art deco, soft/pastel, industrial). Governing line: *"Bold maximalism and refined minimalism both work — the key is intentionality, not intensity."*
- **Typography**: ban Arial/Inter/Roboto/system fonts; pair distinctive display + refined body.
- **Color**: dominant colors with sharp accents over timid even palettes; CSS variables.
- **Motion**: one orchestrated page-load with staggered reveals > scattered micro-interactions; CSS-only for HTML, Motion lib for React.
- **Spatial**: asymmetry, overlap, diagonal flow, grid-breaking.
- **Backgrounds**: gradient meshes, noise, geometric patterns, layered transparency, dramatic shadows.
- **Anti-slop ruleset**: never Inter/Roboto/Arial, never purple gradients on white, never predictable layouts; explicitly *"NEVER converge on common choices (Space Grotesk) across generations."*
- Canonical longer-form source: the [Frontend Aesthetics Cookbook](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb) (`<frontend_aesthetics>` block, decomposed typography/theme prompts).
- **It's easily diluted by weak context** — needs the token/reference/audit layers cila adds. Don't fork it; depend on it.

**Claude Design** (Anthropic Labs, launched 2026-04-17, Opus 4.7, in Pro/Max/Team/Enterprise). Prompt-to-prototype + **design-system extraction from a codebase** (reads CSS token files). Hands Claude Code a structured spec (tokens + component tree + layout, *not pixels*) — which is why the handoff works. Limits: burns tokens hard (~58% of weekly Pro in two sessions → realistically wants Max 20x), **no Figma import, no multiplayer**, first drafts still need engineering taste. Use for *upstream ideation*, not shipping.

Sources: [SKILL.md](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md) · [Frontend Aesthetics Cookbook](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb) · [plugin page](https://claude.com/plugins/frontend-design) · [Introducing Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) · [design-system setup](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design) · [Victor Dibia review](https://newsletter.victordibia.com/p/how-good-is-anthropics-claude-design) · [Claude Design → Claude Code handoff](https://claudefa.st/blog/guide/mechanics/claude-design-handoff)

---

## 2. Anti-"AI-slop" design methodology

**Root cause of slop:** LLMs regress to the statistical mean of training data. Underspecified prompt → median pattern. The purple/indigo default traces to Tailwind shipping `bg-indigo-500` ~2020, propagated through millions of repos (Adam Wathan publicly apologized Aug 2025).

**The slop signature (kill-list):** Inter/Roboto/Arial/Open Sans/system-ui fonts; purple→blue gradients; centered hero + single CTA; three-icon-box feature grid; container soup (>2 nesting levels); uniform 16px radius; shadows at exactly 0.1 opacity; Lucide-everywhere; "teal accent everywhere" (a Claude fingerprint).

**Countermeasures:**
- **Negative constraints** ("no Inter, no purple gradients, no three-box grids, containers ≤2 levels") — transformers can negate at inference.
- **Per-dimension direction** beats "make it nice" — direct attention separately at type/color/motion/background/spacing.
- **Persona priming** ("senior frontend engineer, 20yr, print-design background") shifts the distribution.
- **Request multiple directions** to avoid the first local maximum.
- **Reference-driven design (highest leverage):** anchor to real world-class design. Either describe it ("Linear: dense hierarchy, monospace palette, no decorative shadows") or feed 8–10 screenshots — but **decompose, don't "replicate"** ("extract the primary/accent hex into a Tailwind object", "describe the type scale"). Cap ~4 reference screenshots/generation (vision tokens ~3x).

**Typography (fastest lever):** two-font system (distinctive display + legible body); high-contrast pairing (serif+geometric sans, mono+serif); extremes not adjacents (100/900 weight, 3x+ size jumps); explicit scale. Source distinctive faces from **Fontshare** (Satoshi, General Sans, Cabinet Grotesk, Zodiak), **Pangram Pangram**, not Google defaults. Variable fonts; `preload` + `font-display: swap`.

**Motion:** one orchestrated high-impact moment > scattered micro-interactions. Spatial continuity (animate source→destination bounding box). `transform`/`opacity` only, never `transition: all`. Honor `prefers-reduced-motion`. UI transitions <300ms; ambient loops 3–6s. **Motion** (MIT) for React app layer, **GSAP** for big scroll-driven moments (note: GSAP now Webflow-owned with a license barring competing tools — prefer Motion for generated output).

**Published frameworks:** [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) (100 rules / 17 categories, installable skill from `vercel-labs/agent-skills`) — real ellipsis/curly quotes, `tabular-nums`, `text-wrap: balance`, `:focus-visible`, semantic `<button>`/`<a>`, `color-scheme`, virtualization, image dims. [awesome-claude-design](https://github.com/rohitg00/awesome-claude-design) — 9 aesthetic families with reference tokens, a family-picker decision tree, remix recipes, 5 prompt packs, 8 catalogued Claude fingerprints.

Sources: [Why Your AI Keeps Building the Same Purple Gradient](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) · [AI Slop Web Design Guide](https://www.925studios.co/blog/ai-slop-web-design-guide) · [Vercel guidelines](https://vercel.com/design/guidelines) · [awesome-claude-design](https://github.com/rohitg00/awesome-claude-design) · [design-extract](https://github.com/Manavarya09/design-extract) · [Typewolf — Inter pairings](https://www.typewolf.com/inter) · [Two-font system 2026](https://www.schweitzerdesigns.com/post/two-font-system-pairing-guide-2026) · [Ambient Animations — Smashing](https://www.smashingmagazine.com/2025/09/ambient-animations-web-design-principles-implementation/)

---

## 3. Tooling ecosystem — builders, frameworks, deployment

**AI builders (when a serious dev uses them):** **v0** (`v0.app`, Sonnet-4-base composite + AutoFix, emits shadcn/Tailwind → paste straight into repo; best frontend code; also a Platform API `api.v0.dev/v1/chat/completions`, OpenAI-compatible, `v0-1.5-md/lg`, 512k ctx, paid) — the only builder worth pulling from. **Lovable** (Gemini-3-Flash default, full-stack + Supabase, for non-devs). **Bolt** (Claude, WebContainer, demos). **Subframe** (deterministic real React+Tailwind export, MCP + Skills — strongest design→code for a dev team). Skip the rest for a Claude-centric flow. Caveat: independent testing reports ~40–45% vulnerability rate across builders — always security-review.

**Deployment stack:** **Astro + Tailwind v4 + Cloudflare Pages** for marketing/content (≈90% less JS, better CWV); **Next.js (App Router) + Tailwind v4 + Vercel** for apps. **Tailwind v4** = Oxide engine + CSS-first `@theme` config (tokens in CSS, no `tailwind.config.js`) — the lingua franca AI generates against. CMS: Payload (TS-native, ownership) or Sanity (editorial).

Sources: [v0 vs Bolt vs Lovable](https://particula.tech/blog/lovable-vs-bolt-vs-v0-ai-app-builders) · [v0 composite model](https://vercel.com/blog/v0-composite-model-family) · [Subframe](https://www.subframe.com/) · [Astro vs Next 2026](https://www.kunalganglani.com/blog/astro-vs-nextjs-2026) · [Tailwind v4 Oxide](https://dev.to/dataformathub/tailwind-css-v40-why-the-oxide-engine-changes-everything-in-2026-59cj)

---

## 4. Component & design-system libraries (agent-consumable)

shadcn/ui is an **ecosystem**, consumed via namespaced registries in `components.json` + the **shadcn MCP**. Install via `npx shadcn add @ns/<item>`. Each `registry-item.json` carries `cssVars` (theme/light/dark) so components bring their tokens.

**Default free registries to wire in:** `@shadcn` (base/charts/blocks), `@magicui` (motion polish, MIT), `@aceternity` (hero "wow"; note: hardcodes colors — remap to tokens), `@origin` (400+ advanced primitives), `@cult` (distinctive + AI/agent UI), `@kokonutui` (bold modern), `@tailark` (cohesive *bespoke* marketing blocks), `@reactbits` (animated backgrounds/text). Block marketplace **shadcnblocks** (`@shadcnblocks`, freemium, API key) = opt-in.

**Avoid as defaults:** Park UI / HeroUI (npm-package distribution fights the copy-in/token-travel model); **Tailwind Plus** (no public registry — not agent-consumable).

**shadcn MCP tools:** `get_project_registries`, `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`, `get_audit_checklist`. Agent loop: search → view → examples → add → audit. Pin `shadcn@latest` (≥ CLI v4, Mar 2026).

**Theme/tokens:** **tweakcn** is the recommended token engine — `npx shadcn add https://tweakcn.com/r/themes/<id>.json` (OKLCH, Tailwind v4 `@theme`), and it supports the shadcn registry MCP. Native `shadcn apply --preset <id> --only theme,font` (Apr 2026) swaps a whole preset. **Fonttrio** = font-pairing registry. **Distinctiveness verdict:** shadcn-only + a theme still reads "shadcn"; non-generic = Tailark/Cult structure + Aceternity/React Bits hero + Magic UI motion, unified by one tweakcn token set; prefer token-respecting libs over color-hardcoders.

Known caveats: `cssVars.theme` doesn't always land under `@theme` in `globals.css` (run audit checklist); Motion Primitives has a registry `{name}`-placeholder bug (health-check before defaulting).

Sources: [shadcn Namespaces](https://ui.shadcn.com/docs/registry/namespace) · [registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json) · [shadcn MCP](https://ui.shadcn.com/docs/mcp) · [CLI v4 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) · [shadcn apply](https://ui.shadcn.com/docs/changelog/2026-04-shadcn-apply) · [tweakcn](https://tweakcn.com/) · [registry.directory](https://registry.directory/) · [Tailark](https://tailark.com/docs) · [shadcnblocks namespaces](https://www.shadcnblocks.com/blog/shadcn-private-registry-access-namespaced-registries)

---

## 5. Visual-asset & design-direction tooling (agent-consumable)

Filter = *agent-consumable* (API/MCP/npm/CLI), free-first:

- **Icons** — discovery via **Iconify MCP/API** (`api.iconify.design/{prefix}/{name}.svg`, 200k+ icons; self-host for volume); build via npm sets: **Phosphor** (character), **Lucide/Tabler** (clean), **Hugeicons** (variety).
- **Illustrations** — `iblis-react-undraw` (MIT, recolorable) + Open Peeps / Humaaans (CC0, vendor SVGs). Blush/DrawKit/ManyPixels = human-only.
- **Imagery** — stock: **Pexels API** (free, no hotlink mandate) > Unsplash API (hotlink + attribution required). AI gen: **`shinpr/mcp-image`** (Nano Banana / Gemini image, best text-in-image) or fal.ai/Replicate MCPs. Optimize with `sharp` (resize → webp/avif).
- **Color/theme** — apply via **tweakcn** registry JSON; generate via **Huemint** API (contrast-graph ML) or **uicolors** ramp; validate WCAG in-code with **`colorjs.io`/`culori`** (not a browse-only checker).
- **Backgrounds** — **React Bits** (lightweight, CLI) / **Magic UI** (registry); generate mesh & grain as raw CSS/SVG (`radial-gradient` stacks, `feTurbulence`) — deterministic, no browse-only generators.
- **Fonts** — self-host via **Fontsource** (`@fontsource[-variable]/*`) or **next/font**; default to **Fontshare** faces (Satoshi/Clash) for distinctiveness; ship a curated pairing table.
- **3D** — **R3F + drei** (code-first); CC0 assets from **poly.pizza API** + **Poly Haven** (no login). Spline only when a human supplies a scene; Sketchfab gated by per-user OAuth.
- **Motion** — **Motion** (`motion/react`) + `tailwindcss-motion` / `tailwind-animations` (CSS-only reveals).
- **Design direction / inspiration** — **Mobbin MCP** (official, paid plan, OAuth — `mobbin_search_screens/flows/...`, 621k+ screens; or `pdcolandrea/mobbin-mcp` unofficial free) for on-pattern reference retrieval. For browse-only galleries (**Godly / Land-book / Awwwards / Refero**) drive the **existing Steel MCP** to screenshot targeted pages. Offline pattern datasets: **WebSight** (823k screenshot↔HTML pairs), **Vision2UI**. Plus the awesome-claude-design aesthetic-family catalog baked into the design step.

Hard-blocked (no API; agent must self-generate/screenshot): mesh-gradient web generators, Coolors, Blush/DrawKit/ManyPixels, the inspiration galleries.

Sources: [Iconify API](https://iconify.design/docs/api/) · [iconify-mcp](https://github.com/imjac0b/iconify-mcp-server) · [iblis-react-undraw](https://github.com/vdelacou/iblis-react-undraw) · [Pexels API](https://help.pexels.com/hc/en-us/articles/47677890260761-Is-the-Pexels-API-free-to-use) · [Unsplash API](https://unsplash.com/documentation) · [shinpr/mcp-image](https://github.com/shinpr/mcp-image) · [Huemint](https://huemint.com/about/) · [The Color API](https://www.thecolorapi.com/) · [Fontsource](https://github.com/fontsource/fontsource) · [Fontshare](https://www.fontshare.com/) · [poly.pizza API](https://poly.pizza/docs/api/v1.1) · [Motion](https://motion.dev/) · [Mobbin MCP](https://mobbin.com/mcp) · [pdcolandrea/mobbin-mcp](https://github.com/pdcolandrea/mobbin-mcp) · [WebSight](https://huggingface.co/datasets/HuggingFaceM4/WebSight)

---

## 6. Generation & selection mechanisms (beyond single-pass)

Anthropic's own loop is the blueprint: generator builds → evaluator with Playwright MCP navigates/screenshots → scores 4 weighted criteria (Design / Originality / Craft / Functionality) → feeds back → **5–15 iterations**. Two warnings: aspirational rubric wording ("museum quality") **caused visual convergence**; and the generator was told to **refine if trending up, else pivot aesthetic**.

Mechanisms ranked impact-vs-effort:
- **(Tier 1, prompt-only)** **Verbalized Sampling** — ask for "5 distinct directions, each with a probability, in separate tags" → recovers ~66.8% of base diversity vs 23.8% for direct prompting. **Persona/aesthetic seeding** per candidate. **Pivot-or-refine** after each critique. **Best-of-N via parallel git-worktree subagents** (N=3 sweet spot) → judge → human picks → refine winner.
- **(Tier 2)** **Pairwise/tournament Elo** for *selection* (more stable than absolute scores); reserve absolute rubric thresholds for the *gate*. **Bias-hardened single judge** (randomize A/B order, never self-judge, calibration exemplars, critique-before-score). **ReLook-style** strict-monotonic acceptance (overwrite winner only on strictly-better score) + **zero-reward on invalid render** (build error/blank/console errors auto-reject before vision scoring).
- **(Tier 3)** Multi-judge debate (tie-break only — diminishing returns + bias amplification); DPP/max-min embedding selection of which candidates to build; external v0 API as an architecturally-different generator.

**Cost:** vision tokens (~3x) dominate *evaluation*, not generation. Parallel builds ≈ constant wall-clock. Keep N=3; reserve panels/multi-timepoint for tie-breaks.

Sources: [Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) · [Verbalized Sampling (2510.01171)](https://arxiv.org/html/2510.01171v3) · [ReLook (2510.11498)](https://arxiv.org/html/2510.11498v1) · [Parallel AI coding with git worktrees](https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/) · [Multi-agent debate adaptive stability (2510.12697)](https://arxiv.org/html/2510.12697v1) · [v0 Platform API](https://vercel.com/changelog/v0-platform-api-now-in-beta)

---

## 7. Memory, learning & taste personalization

A plugin gets a stable writable dir: **`${CLAUDE_PLUGIN_DATA}`** (`~/.claude/plugins/data/{plugin-id}/`). A **SessionStart hook** can inject a compressed index into context (how `claude-mem` works). Mechanisms (top-3 first):
1. **File-based taste profile** (`taste/*.md` in plugin data, auto-loaded via SessionStart) — the self-improving-skill pattern: read learnings before a run, rewrite after. Many small focused files; prune stale.
2. **Approved-example few-shot bank** (approved `DESIGN.md` + final screenshot + why-it-worked) fed back as exemplars. UICrit showed **+55%** UI-feedback quality from few-shot + visual prompting alone.
3. **`@cila` private shadcn registry** — promote winning bespoke components post-ship; `registry-item.json` carries tokens, so reuse stays themed. (This is exactly v0's loop.)
4. **CIPHER/PRELUDE edit-diff learning** — after a human edits cila's output, infer a natural-language preference from the diff, store keyed by context, retrieve k-closest next time. "Post-edits are preferences too."
5. Accept/reject log during the critique loop; approved screenshots become Playwright visual baselines (dual-use: regression guard + training signal).
6. **Mobbin MCP** for external reference retrieval; **DTCG** (W3C, stable 2025.10) as token lingua franca + Style Dictionary v4.
- **Defer vector RAG** — 2026 consensus: agentic grep/glob/read beats embeddings for code/structured assets; reserve vectors for free-text decision logs only.

Note: the native **memory tool** (`memory_20250818`) is an API/Agent-SDK primitive; inside a plugin, replicate its *conventions* on `${CLAUDE_PLUGIN_DATA}` + SessionStart hook instead.

Sources: [Claude memory tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool) · [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) · [self-improving skills](https://www.mindstudio.ai/blog/self-improving-ai-skills-claude-code) · [claude-mem](https://github.com/thedotmack/claude-mem) · [UICrit (2407.08850)](https://arxiv.org/abs/2407.08850) · [PRELUDE/CIPHER (2404.15269)](https://arxiv.org/abs/2404.15269) · [shadcn registry](https://ui.shadcn.com/docs/registry) · [DTCG 2025.10](https://www.designtokens.org/tr/drafts/format/) · [RAG is not always the answer](https://dev.to/nimay_04/rag-is-not-always-the-answer-anymore-how-ai-agents-search-code-in-2026-43m3)

---

## 8. Machine-checkable verification (gates an agent can't charm)

Most "good design" failures are **structural facts about the rendered DOM** — assertable via `getComputedStyle` + bounding boxes + the a11y tree. Run headless in CI; the LLM/perceptual judge is the *last*, advisory gate. Ranked:

**Tier 1 (build first):**
1. **Token conformance at the rendered layer** — walk visible elements, read computed color/bg/border/shadow, assert membership in the set resolved from `:root` custom props. Catches hardcoded `#3b82f6` / Tailwind arbitrary values that survive a build. (`toHaveCSS` reads custom props poorly — use `evaluate`/`getComputedStyle`.)
2. **Spacing-grid + type-scale conformance** — computed margin/padding/gap `% base === 0`; font-size ∈ scale. Catches "AI picked 13px".
3. **Layout invariants across viewport matrix** (360/768/1024/1440): no horizontal scroll (`scrollWidth <= clientWidth`), no overflow, no unintended overlap (rect math + `elementsFromPoint`; `isVisible` lies under occlusion), touch targets ≥24×24 (WCAG 2.5.8).
4. **Focus-visible / interactive-state presence** — Tab loop, assert focused computed style differs from resting; focus order matches DOM.
5. **Contrast from rendered colors** — axe-core computes against flattened DOM; run post-render across the matrix.
6. **Heading hierarchy + visual-vs-DOM reading order.**

**Tier 2:** perceptual + masked visual regression (Playwright `toHaveScreenshot` + `animations:'disabled'` + `mask` + SSIM; semantic AI diff via Applitools/Percy opt-in); **CWV as CI gates** (`web-vitals`/PerformanceObserver for CLS/INP/LCP; CLS is an un-fakeable design-quality signal); **compositor-only animation** verification (Lighthouse "non-composited animations" audit + scan `@keyframes` for layout-triggering props).

**Tier 3:** **DESIGN.md → assertion suite** — author tokens in **DTCG**, validate, pipe through Style Dictionary, and **derive the Tier-1 allow-sets from the resolved tokens** so the test suite *is* the design system (property-based: "∀ visible element: color ∈ tokens"). Multi-modal gate: structural ∧ perceptual/LLM — LLM judge runs *only after* structural gates pass and never overrides a hard structural fail.

a11y baseline: **WCAG 2.2 AA** (3.0 is a draft, ~2029). Automation catches only ~25–40% of issue *types* → keep real screen-reader spot-checks (NVDA/VoiceOver/TalkBack) per release.

Sources: [Playwright a11y testing](https://playwright.dev/docs/accessibility-testing) · [getComputedStyle in Playwright](https://shiv-jirwankar.medium.com/get-css-properties-of-web-element-with-playwright-e092fdc9f462) · [axe-core](https://github.com/dequelabs/axe-core) · [Enforcing design tokens](https://medium.com/@barshaya97_76274/design-tokens-enforcement-977310b2788e) · [Playwright visual testing](https://testdino.com/blog/playwright-visual-testing) · [web-vitals](https://github.com/googlechrome/web-vitals) · [Lighthouse non-composited animations](https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations) · [DTCG 2025.10](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) · [Style Dictionary DTCG](https://styledictionary.com/info/dtcg/) · [OneRedOak claude-code-workflows (design-review)](https://github.com/OneRedOak/claude-code-workflows) · [accessibility-agents](https://github.com/Community-Access/accessibility-agents)

---

## 9. Orchestration, harness & emerging tooling

**Architecture:** three-role **file-mediated** loop (Planner → Generator → Evaluator), each a subagent with its own context window, communicating through files (`features.json` with binary `passes`, `claude-progress.txt`) — survives context resets, restartable. Evaluator takes an adversarial critic stance + LLM-as-judge rubric. Verification taxonomy: **rules-based** (lint/tsc/build — cheapest/strongest) → **visual** (Playwright) → **LLM-judge** (sparingly). Make sprint decomposition optional/tunable (Anthropic dropped it on newer Opus).

**Context/token budget (kills multi-MCP plugins):** push heavy MCPs **into the evaluator subagent's window** so they don't pollute the lead (biggest lever); put bulky how-to in **skills** (progressive disclosure), not always-on MCP/CLAUDE.md; lazy-enable MCPs, `/mcp` hygiene; never dump large logs into context.

**Headless/CI:** `claude -p` runs the loop and exits → `bin/cila-run`. GitHub Action via `anthropics/claude-code-action@v1` for PR design-review (~20k tokens/review). Schedule / `robot ping` for unattended sweeps.

**Emerging MCPs to wire:** **Chrome DevTools MCP** (`performance_start_trace` → CWV gate); **shadcn MCP**; **Figma Dev Mode MCP + Code to Canvas** (optional design source/roundtrip); **v0 Models API** (optional parallel explorer); Playwright MCP / existing **Steel** as the evaluator's eyes.

**"Wow" capability stack** (agents fail without vetted patterns): **Motion** skill (MIT, prefer over Webflow-owned GSAP); **R3F skill** with production patterns (exponential damping via `maath`, per-material shaders, mutable refs over state); **shader/generative-background** recipe library; motion guardrails (`prefers-reduced-motion` + CWV budget).

**Plugin composition:** `dependencies` field in `plugin.json` (semver, transitively enabled) → depend on `frontend-design` rather than vendor it; meta-plugin symlinks (within same marketplace); set explicit `version`; `${CLAUDE_PLUGIN_ROOT}` for bundled scripts, `${CLAUDE_PLUGIN_DATA}` for persisted state (install vendored `node_modules` once via SessionStart hook); **hooks for gating** (`Stop`/`SubagentStop` enforce the production gate before "done"; `SessionStart` runs the onboarding ritual); `userConfig` to collect API keys/viewports/budgets at install.

Sources: [Harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps) · [Building agents with the Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk) · [Plugins reference](https://code.claude.com/docs/en/plugins-reference) · [claude-code-action](https://github.com/anthropics/claude-code-action) · [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) · [Figma Code to Canvas](https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/) · [MCP token overhead](https://www.mindstudio.ai/blog/claude-code-mcp-server-token-overhead) · [GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion) · [R3F patterns — Codrops](https://tympanus.net/codrops/2026/02/24/from-flat-to-spatial-creating-a-3d-product-grid-with-react-three-fiber/)

---

## Caveats / confidence notes

- v0 Platform API specifics came from search excerpts (vercel.com TLS failed on direct fetch) — confirm before hard-coding.
- shadcn `registry-item.json` `cssVars` scope details came from mirrors (ui.shadcn.com cert errors in research env) — confirm against the official schema.
- The "40–45% vulnerability rate" across AI builders is a directional comparison-article figure, not a formal audit.
- `claude-code-action` examples showed stale model ids — use current model ids.
