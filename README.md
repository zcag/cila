# cila

**A design studio for Claude Code.** Describe what you want — *"a landing page for a climate-data startup"* or *"a dashboard for my analytics tool"* — and cila builds a site **or app** that looks **designed**, reads like a **pro wrote the copy**, is **structured like a senior UX designer laid it out**, and **passes production gates**. Not another generator of purple-gradient, Inter-font, three-card AI slop.

cila is a self-contained Claude Code **plugin**. Install it once; from then on a single entry point (`/cila:go`) — or just describing a site — runs the whole thing.

> *cila* (Turkish): **polish, gloss** — the craft layer over raw components.

---

## The idea: an expert, wired into clever mechanisms

The same model produces wildly different quality depending on the **harness** around it. cila is that harness. Two halves:

### 🎓 The expert — real craft knowledge, encoded
Most "AI website" tools only know *components*. cila carries the knowledge a senior team would bring across **all three legs of web design**:

- **Content & messaging** — Dunford positioning, Jobs-To-Be-Done, the Value Proposition Canvas, Schwartz's 5 stages of awareness, StoryBrand narrative, conversion copywriting (PAS / BAB / FAB), voice-of-customer mining, brand voice charts, and a hard **anti-slop kill-list** (no "unlock your potential", no "we help businesses grow").
- **Visual design** — a committed aesthetic direction (editorial, brutalist, luxury, retro-futuristic…) instead of the timid mean; OKLCH design-token systems from a single brand hue; distinctive typography (banned: Inter / Roboto / Space Grotesk); one orchestrated motion moment; an **asset-led "wow" tier** (real product video, Rive/Lottie, live embeds, premium components, then shaders/3D/canvas, then CSS).
- **Production** — WCAG 2.2 AA, Core Web Vitals / INP, modern CSS, scannability, content-first information architecture, answer-engine (AEO/GEO) structure.

### ⚙️ The mechanisms — a harness that holds the expert honest
- **Content-first orchestration.** `/cila:go` decides *what to say* before *how it looks* — content hierarchy drives visual hierarchy. It auto-detects new-vs-existing repo, scaffolds or adopts an existing look, and never makes you learn its internals.
- **A separate critic.** The builder never grades its own work. One `design-reviewer` subagent drives a real browser, **interacts** with the page (scroll, hover, tab, resize, reduced-motion), runs the gates, checks behavioral a11y, and grades it against the contract with **cited evidence** — no "looks good". Impact/wow is a **blocking** axis, not a note.
- **Gates you can't charm.** Four lean structural checks assert *facts about the rendered DOM* — axe WCAG 2.2 AA is clean, every color is a real token (computed-style, stylelint-guarded), motion has a `prefers-reduced-motion` fallback, Lighthouse/CWV budgets hold. **A pretty screenshot never passes a hard fail.**
- **Wow is asset-led, with a carve-out.** The hero leans on real assets (product video/recording, Rive/Lottie, live embeds, premium components, then shaders/3D/canvas, then CSS) — not prose-summoned animation. The one **signature moment** is named up front in DESIGN.md and gets a carve-out: richer techniques (layout/canvas/WebGL) in an isolated zone, exempt from the page's compositor-only/CLS conventions — while a11y and reduced-motion stay non-negotiable. The first cut is a **hard checkpoint**.
- **A frozen contract.** Before building, the deterministic + visual + message criteria for "done" are agreed in `ACCEPTANCE.md` and reference-anchored — criteria get ticked, never quietly deleted.

The throughline: **the gates and the contract make taste accountable; the expert knowledge makes the taste good.**

---

## What makes it different

- **All three legs, not just pixels.** A gorgeous shell with "Welcome to our platform" copy still fails. cila does the message, the look, *and* the hardening.
- **Marketing *and* apps.** cila branches by project type — conversion copy + StoryBrand for marketing pages; interaction-design craft (IA, app shell, the full state matrix, WAI-ARIA components, "no dead-end states") for dashboards/tools — instead of forcing landing-page framing onto an app.
- **One door, zero jargon.** You collaborate on the *look and the message*; everything technical (framework, scaffolding, gates, tokens) is handled silently.
- **Distinctive by construction.** It commits to a bold aesthetic and bans the AI-slop signature — the output is meant to look like *a* studio made it, not *the* studio every AI makes.
- **Honest about scope.** cila is **build-time only**. It does not instrument, monitor, or run experiments on your deployed site. Deployment is yours.
- **Free & keyless by default.** Everything load-bearing (shadcn, Playwright, axe, Lighthouse, free component registries, self-hosted fonts) costs nothing. Paid extras (custom AI hero-art, premium templates) are opt-in with free fallbacks.
- **Composition, not reinvention.** Built on the official `frontend-design` skill, shadcn registries, Playwright, axe-core, Lighthouse, and the design-review pattern — cila adds the collaborative direction, the content layer, the token contract, and the glue.

---

## How it works

```
/cila:go "build me a landing page for X"   (or just say it — cila auto-activates)
   │
   ▼
0 Assess      detect new vs existing repo · framework · intent          (silent)
1 Direction   MESSAGE first (positioning · copy · voice → CONTENT.md),
              then LOOK (aesthetic · OKLCH tokens · reference-anchored,    (collaborate
              named signature moment → DESIGN.md); freeze ACCEPTANCE.md.   on taste only)
2 Materialize scaffold/adopt · wire tokens, components, gates            (silent)
3 Build       real copy (no lorem) + the committed aesthetic + the asset-led
              wow moment. First cut is a HARD checkpoint, then chunks.
4 Review&gate one critic: render-health → 4 lean gates → behavioral a11y →
              visual + message critique → blocking Impact/wow. Iterate until PASS.
5 Hand back   show it.
```

A `Stop`-gate hook keeps it from declaring "done" while gates are red.

---

## Install

```bash
# in Claude Code
/plugin marketplace add zcag/cila
/plugin install cila@cila-marketplace
```

Then just ask for a site (`/cila:go` or *"build me…"*). Verify with `/plugin`, `/help`, `/agents`.

---

## What's inside

| | |
|---|---|
| **Front door** | `skills/go` → `/cila:go` (also auto-invoked) |
| **Subagents** | content-strategist · design-director · design-reviewer · ux-architect |
| **Skills** | go · content-structure · copywriting · voice · design-tokens · frontend-aesthetics · motion · inspiration · wow · app-ux |
| **Templates** | Astro & Next starters (build-verified) · the wow component library (incl. `templates/wow/r3f/`) · production gates · DESIGN.md / CONTENT.md / ACCEPTANCE.md contracts |

---

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structure, the build loop, the mechanisms
- [`docs/RESEARCH.md`](docs/RESEARCH.md) · [`docs/RESEARCH-CONTENT.md`](docs/RESEARCH-CONTENT.md) · [`docs/RESEARCH-FRONTIER.md`](docs/RESEARCH-FRONTIER.md) — the evidence base, with sources
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — locked decisions + rationale
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — what's built and what's next
- [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md) — optional paid/keyed extras (all with free fallbacks)

---

## Status

Actively built. The core (content + visual + production), the asset-led wow tier with its signature-moment carve-out, and the lean gate stack are in place. cila stays **lean and build-time only** — no benchmark subsystem, no deployed-site instrumentation. It's a **design partner, not a black box** — it collaborates on the calls only a human should make, and proves the rest.

*Built on the shoulders of the [`frontend-design`](https://claude.com/plugins/frontend-design) skill, [shadcn/ui](https://ui.shadcn.com), [Playwright](https://playwright.dev), [axe-core](https://github.com/dequelabs/axe-core), and the design-review pattern.*
