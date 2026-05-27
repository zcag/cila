# cila

A portable **design studio for Claude Code** — it makes Claude produce *gorgeous, production-grade* websites instead of generic "AI slop."

`cila` is a self-contained Claude Code **plugin**: install it once and any agent in any repo can use it. It bundles a collaborative aesthetic-direction step, a token-locked design contract, premium (free) component registries, a visual-critique build loop, and machine-checkable production gates.

> *cila* (Turkish): **polish, gloss** — the craft layer over raw components.

## Why

The same model produces wildly different quality depending on the **harness** around it. `cila` is that harness, packaged. Its design rests on findings from deep research (see [`docs/RESEARCH.md`](docs/RESEARCH.md)):

1. **Input specificity** beats prompting — a committed aesthetic + a real design system + reference decomposition + explicit negative constraints.
2. **A persistent design contract** (`DESIGN.md` + tokens) the model re-reads every session, so it can't drift back to Inter / purple gradients / three-card grids.
3. **The agentic visual-critique loop** — a *separate* evaluator screenshots the rendered page and grades it; the generator never grades itself.
4. **Premium component registries** instead of vanilla shadcn.
5. **Production gates as hard enforcement** — a11y, perf, and computed-style token conformance that a pretty screenshot can't charm.

## Status

**Design / research phase.** This repo currently holds the research archive and the build plan. Implementation is staged — see [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Docs

- [`docs/RESEARCH.md`](docs/RESEARCH.md) — consolidated findings from six deep-research passes, with sources.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the target plugin design (structure, the loop, the mechanisms).
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased build plan (Phase 1 = lean core, 2 = compounding, 3 = scale & wow).
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — locked decisions and their rationale.

## Approach

`cila` is a **composition layer**, not a from-scratch reimplementation. It depends on / wires in existing open-source pieces (`frontend-design`, OneRedOak design-review, Vercel web-interface-guidelines, shadcn MCP, Playwright MCP, axe-core, …) and adds only the ~20% that's genuinely missing: the collaborative design step, the locked token contract, per-repo materialization, and the glue.
