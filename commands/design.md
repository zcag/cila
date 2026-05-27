---
description: Collaboratively decide a bold aesthetic direction, then write the locked DESIGN.md + OKLCH tokens.
argument-hint: [what you're building — e.g. "landing page for a climate-data SaaS"]
---

Run cila's collaborative aesthetic-direction flow for: **$ARGUMENTS**

Delegate to the **design-director** subagent. It will:

1. **Diverge** — propose 3–5 genuinely distinct directions (verbalized sampling) as a flat markdown list with rationale. Not variations of one idea — different regions of design space.
2. **Decide with me** — discuss trade-offs conversationally and converge on one (or a remix). If I gave a reference site/screenshot, it *decomposes* it into tokens ("use its composition, apply our system") rather than replicating it.
3. **Lock it** — write `DESIGN.md` (the design contract) and `src/styles/tokens.css` (OKLCH, Tailwind v4 `@theme`, derived from a single `--brand-hue`).

Rules:
- Honor the `frontend-design` skill and the negative-constraints list (no Inter/Roboto/Arial/Space Grotesk, no purple-on-white gradients, no cliché layouts).
- **Do not build UI yet** — this command only produces the contract.
- End by telling me the chosen direction, the files written, the `--brand-hue` value, and to run `/cila:init` next.
