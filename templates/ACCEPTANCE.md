<!--
  ACCEPTANCE.md — the frozen acceptance contract for this build.
  Agreed by the planner (content-strategist + design-director) and the evaluator (design-reviewer)
  BEFORE Stage 3 build — the "sprint contract". APPEND-ONLY: tick `passes`, never edit or delete a
  criterion once written. The gate order is fixed: deterministic rules → visual-diff vs DESIGN.md →
  trajectory/LLM judge. The deterministic layer is the charm-proof spine; the judge is the last, weakest signal.
-->

# Acceptance Contract — <project / page>

## "Done" means (agreed before any build)
- <the ONE core message from CONTENT.md is clear above the fold>
- <the committed aesthetic from DESIGN.md is realized — name it>
- <scope: which page(s)/section(s) this contract covers>

## Deterministic gates — HARD (must pass; can't be charmed)  ·  `npm run gate`
- [ ] Render-health: builds, renders, no console errors
- [ ] Token conformance: no raw hex / off-token color (computed-style)
- [ ] Spacing on grid (4px margins / 2px padding) · type on scale
- [ ] Layout invariants @ 360/768/1024/1440: no h-scroll, no overflow, no unintended overlap; touch targets ≥24px
- [ ] axe WCAG 2.2 AA clean · visible focus · `prefers-reduced-motion` honored
- [ ] Lighthouse budgets (LCP/CLS/TBT·INP) · compositor-only animation
- [ ] Anti-slop kill-list returns zero (copy)
- [ ] <project-specific, e.g. JSON-LD present · contrast ≥ target>

## Visual & message — judge vs DESIGN.md + CONTENT.md (evidence-cited)
- [ ] Hero passes the 5-second clarity test
- [ ] Headline specific / falsifiable / differentiated
- [ ] Every section survives "So what?" · one clear primary CTA
- [ ] Realizes the committed tone · scannable (layer-cake)

## Subjective — human gate (never auto-passed)
- [ ] Taste sign-off on the signature moment / overall feel

<!--
  The Stop/SubagentStop hook keys off the deterministic layer via .cila/state.json `gate_required`.
  design-reviewer must cite a screenshot region + the relevant DESIGN.md/CONTENT.md/ACCEPTANCE.md clause
  before each sub-score. Criteria are never removed once written — only ticked.
-->
