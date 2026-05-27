# cila — Frontier Research ("take it further")

Forward-looking research for net-new directions beyond the built core (content + visual + production) and the deferred Phase 2. Four passes, 2026 sources. These are **options, not commitments** — see `ROADMAP.md` "Frontier directions". Ranked impact-vs-effort within each theme.

The four themes converge on one thesis: **measurement is the keystone.** A scoreboard + production signal turns cila from "emits good sites" into "holds a model of the site and improves it against real outcomes." That loop is the moat no other AI design tool has.

---

## Theme A — Measurable & self-improving (the moat)

Honest 2026 finding: MLLM judges *rank* design adequately (Pearson ~0.7) but *score* poorly in absolute terms and are **weakest exactly on aesthetics/emotion** — so use **pairwise/arena Elo over your own corpus**, never absolute 1–10, and keep humans + conversion on the taste axis.

Top mechanisms (build order 1→…):
1. **cila-Bench** — a private frozen brief set (~30) + pairwise **TrueSkill/Elo** leaderboard comparing each cila version vs its predecessors and vs v0/Lovable/Bolt. *Without this, "self-improving" is unmeasurable.* (Model on **UI-Bench**.)
2. **Cross-family judge + frozen human-rated holdout** — generate with Claude, judge with a *different* family (self-preference bias is real and persists even when authorship is hidden); validate the auto-judge against ~30–50 human-rated pages. The honesty anchor.
3. **Instrument-by-default** (see Theme C #1) — unlocks the real signal.
4. **GEPA** (reflective prompt evolution; ICLR 2026 oral) over cila's orchestrator/subagent prompts, scored on cila-Bench — beats RL by 6–20% with ~35× fewer rollouts. The compounding engine.
5. **CIPHER/PRELUDE diff→preference learning** — infer a one-line preference from each user *edit*, store keyed by context, retrieve k-nearest into the build prompt. A `taste.md` that **writes itself**. (PROSE adds a refinement loop so it doesn't drift.) The signature feature.
6. **Curated example bank** (MemSkill-style) — every shipped, high-scoring page becomes a retrievable exemplar (gated by cila-Bench score). Best-of-N seeds from nearest exemplars. The compounding asset.
7. **Conversion→design-system writeback** — the variant that *converted* is the strongest label; write "pattern X converted +Y% on segment Z" into the preference store (behind a significance gate).

Eval honesty guards (load-bearing): cross-family judging, rotating/held-out rubric, conversion-significance gate, periodic adversarial human audit. Goodhart/self-preference/rubric-gaming are documented and real.

Sources: [UI-Bench (2508.20410)](https://arxiv.org/abs/2508.20410) · [MLLM-as-UI-Judge (2510.08783)](https://arxiv.org/html/2510.08783v1) · [UICrit (2407.08850)](https://arxiv.org/abs/2407.08850) · [GEPA (2507.19457)](https://arxiv.org/abs/2507.19457) · [PRELUDE/CIPHER (2404.15269)](https://arxiv.org/abs/2404.15269) · [PROSE (2505.23815)](https://arxiv.org/html/2505.23815v1) · [Self-preference bias (2604.22891)](https://arxiv.org/html/2604.22891v1) · [Preference leakage (2502.01534)](https://arxiv.org/pdf/2502.01534)

---

## Theme B — Frontier web capabilities (keep output ahead-of-curve)

Mostly **cheap skill/gate upgrades**, shipped as progressive enhancement behind `@supports` (degrade gracefully → low risk). Flagged NET-NEW / UPGRADE / GATE.

Tier 1 (do first):
- **View Transitions API** (NET-NEW skill) — same-doc is Baseline (Oct 2025); cross-doc (MPA) Chromium+Safari, Firefox flagged. The biggest "feels-2026" upgrade; Astro `<ClientRouter/>` / Next `view-transition-name`. Pairs with Speculation Rules.
- **Scroll-driven CSS** (`animation-timeline: scroll()/view()`) (UPGRADE motion/wow → default) — off-main-thread, improves INP; replaces JS/IO reveals for the common case.
- **Speculation Rules API** (NET-NEW default/gate) — prerender likely-next pages → instant nav; makes cross-doc VT feel instant.
- **INP ≤200ms p75 as a named gate** (UPGRADE gates) — the metric most AI sites silently fail; `scheduler.yield()`, `content-visibility:auto`.
- **popover + `<dialog>` + Invoker Commands** (NET-NEW default + a11y gate) — Baseline across browsers (Jan 2026); native top-layer + focus mgmt; an a11y *correctness* win over hand-rolled modal JS.
- **`text-wrap: balance/pretty`** (UPGRADE, near-zero effort) — instant "designed by a human" tell on headings/body.

Tier 2:
- **CSS anchor positioning** (NET-NEW default) — Baseline 2026; deletes the Floating UI dep.
- **WebGPU-primary + WebGL2 fallback + TSL** (UPGRADE r3f/shaders) — WebGPU Baseline Jan 2026; what's driving the current award tier.
- **AEO/GEO content** (UPGRADE content-structure) — Princeton GEO data: expert quotes +41%, stats +30%, citations +30%, readability +22%; question-led H2s + 40–60-word answer-first blocks + JSON-LD schema gate. Compounds with our StoryBrand/scannability.
- **Container queries + `:has()` + `@scope` + `@starting-style`** (UPGRADE) — make component-driven responsiveness + JS-free state the default.

Selective: tasteful **adaptive UI / AI-transparency** (narrow, opt-in — *not* runtime LLM-generated layouts); **native masonry/grid-lanes** (WATCH — interop not there); **islands-first vs RSC** decision heuristic in `go`.
**Skip:** `llms.txt` — Google doesn't use/endorse it; ~0.13% adoption, no measurable lift; only useful for dev-docs sites. The real AI-discovery win is schema + answer-first content.

Sources: [web.dev: same-doc VT Baseline](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available) · [MDN View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) · [MDN scroll-driven](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) · [web.dev INP](https://web.dev/articles/inp) · [MDN Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) · [MDN anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning) · [web.dev WebGPU Baseline](https://web.dev/blog/webgpu-supported-major-browsers) · [GEO guide (Princeton data)](https://www.surmado.com/blog/answer-engine-optimization-aeo-geo-guide) · [Google/Mueller on llms.txt](https://www.seroundtable.com/google-does-not-endorse-llms-txt-40789.html)

---

## Theme C — Launcher → lifecycle partner (close the production loop)

Conceptual upgrade: cila stops *emitting a site* and starts *holding a model of it* (event schema, token contract, entity graph, experiment ledger) and editing it against real outcomes.

Tier 1 (highest leverage; agent-feasible now):
1. **Auto-instrument every generated site** — Plausible (cookieless, content sites) or **PostHog** (analytics+replay+flags+experiments). Bake in `web-vitals` *attribution* build (which element caused bad INP/CLS) + a small versioned event schema (CTA/scroll/funnel) auto-tagged on the components cila generates. *Unlocks everything downstream.*
2. **CRO as a closed loop via MCP** — **PostHog MCP** (`experiment-create`, `query-run`) and **GrowthBook MCP** (create tests, read results) let cila *propose → launch → read* experiments, then feed winners back (Theme A #7). Vercel Edge Config/Flags for sub-ms edge A/B.
3. **CRO backlog / "what to test"** (pure LLM, no traffic needed) — audit the page against evidence-ranked priors (headline → social proof → hero → form → CTA), emit an ICE-ranked hypothesis list + auto-generate variants.

Honest caveats: **experiments need traffic** (~14.8k sessions/variant for a 5% MDE on 3% baseline; ~41% of real tests are underpowered); **peeking inflates false positives** (use sequential/always-valid inference, pre-commit sample size; Bayesian isn't immune). For low-traffic sites, fall back to heuristics + before/after RUM and *say so*.

Tier 2/3: programmatic/full-site pages (Astro Content Layer) with thin-content/orphan/staged-rollout gates; **design-system governance** (token versioning, system-first generation, drift detection — cila generates *and* maintains, so it can enforce at write-time); **i18n** (Astro i18n / `next-intl`, logical properties for RTL, text-expansion-safe layouts); **redesign intelligence** (audit existing site + content-decay + pre-redesign baseline).

Sources: [web-vitals (attribution)](https://github.com/googlechrome/web-vitals) · [PostHog Experiments](https://posthog.com/docs/experiments/creating-an-experiment) · [PostHog MCP](https://posthog.com/docs/model-context-protocol) · [GrowthBook MCP](https://growthmethod.com/growthbook-mcp/) · [Vercel Edge Config GA](https://vercel.com/blog/vercel-edge-config-is-now-generally-available) · [A/B sample size](https://www.optimizely.com/insights/blog/how-to-calculate-sample-size-of-ab-tests/) · [Always-valid inference (1512.04922)](https://arxiv.org/pdf/1512.04922) · [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) · [DS governance/drift](https://www.uxpin.com/studio/blog/design-system-governance/) · [next-intl](https://next-intl.dev/docs/design-principles)

---

## Theme D — Harden the harness (reliability at the frontier)

Tier 1:
1. **Rubric/evidence-grounded judging** — make design-reviewer **cite the offending screenshot region + the DESIGN.md/CONTENT.md clause** before each per-criterion sub-score; anchor to the gold reference. Kills the "illusion of consensus" (judges agreeing via different flawed reasoning).
2. **Agent-as-judge over trajectory** — judge the *interacted* app (scroll/hover/tab/resize/reduced-motion via Steel/Playwright), not one static screenshot. (Agent-judge disagreed with humans 0.3% vs ~31% for static LLM-judge on code tasks.) Reserve for the gate + tie-breaks (~2–3× cost).
3. **Verification-first spine + frozen `ACCEPTANCE.md`** — planner+evaluator agree on "done" *before* building (a sprint contract): deterministic checks (token-only color, axe-clean, Lighthouse/INP thresholds, reduced-motion present, copy contains the core message) → visual-diff → LLM judge. Append-only; the agent ticks `passes`, never edits/deletes a criterion.
4. **Durable resumable log** — add `.cila/progress.md` (append-only decisions/passed/pending) alongside `state.json`; each stage *begins* by reading progress + git log + running the gate (read-before-act).
5. **Bias hygiene (free)** — position-swap each pair & require consistency; explicitly penalize length/verbosity bias; watch self-model bias once a non-Claude (v0) candidate enters.

Tier 2: **diversity-preserving best-of-N** — select on *measured* realized divergence (palette/type/layout/motion vectors from tokens.css + DOM), not pre-build self-estimates, so candidates that converged during build get caught. Keep **N=3** (vision tokens ~3× dominate; token usage ≈80% of multi-agent perf variance). **Bounded reflexion gated by the external gate** (never unanchored self-critique — intrinsic self-correction degrades without a verifier).

Tier 3 (as the plugin grows past ~30–40 skills): **skill routing** (SkillRouter asymmetric pattern: router sees full text, agent sees name+desc) + merge/split; **cost tiers** in `/cila:go` (draft/standard/flagship → N, judging depth, screenshots).

No-gos: don't scale N>3 by default; don't adopt full Managed-Agents Session/Sandbox virtualization (plugin gets 80% from progress.md+git); don't trust unanchored self-correction; don't over-merge skills (progressive disclosure keeps 18 cheap).

Sources: [Anthropic — long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) · [Anthropic — three-agent harness](https://www.anthropic.com/engineering/harness-design-long-running-apps) · [Anthropic — multi-agent research](https://www.anthropic.com/engineering/built-multi-agent-research-system) · [Agent-as-judge survey (2508.02994)](https://arxiv.org/html/2508.02994v1) · [Illusion of consensus (2603.11027)](https://arxiv.org/pdf/2603.11027) · [LLMs can't self-correct yet (ICLR)](https://proceedings.iclr.cc/paper_files/paper/2024/file/8b4add8b0aa8749d80a34ca5d941c355-Paper-Conference.pdf) · [SkillRouter (2603.22455)](https://arxiv.org/pdf/2603.22455)

---

## Recommended sequencing (if pursued)
The keystone is **measurement**: build **cila-Bench + the human-holdout honesty anchor (A1–A2)** and **instrument-by-default starters (C1)** first — they unlock GEPA (A4), taste-learning (A5), and the CRO loop (C2). In parallel, the **frontier-web upgrades (B)** are cheap, low-risk "stay sharp" wins doable anytime. The **harness hardening (D1–D5)** makes the existing loop more reliable and is mostly prompt-level. Lifecycle (C2/C3) and the wow-ceiling extras pay off once measurement exists.
