---
name: reference-extract
description: Decompose a reference site or screenshot into reusable design tokens and patterns (palette, type, scale, spacing, layout) — to anchor a build to real world-class design instead of generic priors. Use when the user provides a reference URL/image or says "make it like X".
---

# Reference Extraction

Anchor output to real, world-class design — the highest-leverage anti-slop move. The rule: **decompose, never replicate.** Extract the design *language* and apply it through the project's own system. Frame it as *"use this composition/feel, apply our tokens."*

## From a URL
- Deterministic first: `npx brandmd <url>` (→ DESIGN.md + CSS vars + Tailwind, no LLM) or `design-extract` (→ DTCG tokens, Tailwind v4, shadcn theme, motion tokens) if available.
- Otherwise WebFetch the page and read its CSS/computed styles; or drive the Playwright/Steel MCP to screenshot it.

## From screenshots
Don't say "replicate this." Extract by **dimension**, one at a time:
- **Color** → "pull primary/secondary/accent as hex, then convert to OKLCH + a `--brand-hue`."
- **Type** → families, the pairing (display vs body), the scale and weights.
- **Spacing** → the rhythm and grid base.
- **Layout** → the composition (asymmetry, density, where the eye goes) — borrow this, not the pixels.
- Feed different references at different stages (color early, component detail later). Cap ~4 reference images per generation (vision tokens ~3×).

## Output
Write the extracted system into the project's `DESIGN.md` + `tokens.css` (follow the **design-tokens** skill). Keep what makes the reference distinctive; drop anything that's just its brand. Note explicitly which choices are "borrowed composition" vs "our system."

## Sources of references the agent can pull
- On-pattern UI: Mobbin MCP (if configured), or drive the Steel/Playwright MCP to screenshot specific gallery pages (Godly, Land-book, Awwwards, Refero).
- Keep a short curated list of reference URLs so retrieval is targeted, not a crawl.
