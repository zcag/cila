---
name: frontend-aesthetics
description: cila's catalogue of bold aesthetic directions + the anti-AI-slop fingerprint counters. Use alongside the official frontend-design skill when choosing or committing to a visual direction, or to diagnose why output looks generic.
---

# Frontend Aesthetics (cila)

Extends the official `frontend-design` skill with concrete *families* to commit to and a fix-list for AI-slop fingerprints. The rule stands: **intentionality, not intensity** — bold maximalism and refined minimalism both work; the timid middle is what fails.

## Aesthetic families (pick ONE, commit hard)
Each has a feel, a reference register, and a starting type/color hint:

- **Editorial / Magazine** — serif display + clean sans body, generous negative space, asymmetric grid. (Linear, Stripe docs register.)
- **Brutalist / Raw** — monospace or grotesk, hard borders, exposed structure, high contrast, minimal radius.
- **Luxury / Refined** — restrained palette, fine hairlines, slow motion, premium serif, lots of air.
- **Retro-futuristic** — neon-on-dark or CRT/terminal, glow, scanline/grain texture, geometric display.
- **Organic / Natural** — warm earthy OKLCH palette, soft shapes, hand-drawn or humanist type.
- **Maximalist** — dense, layered, clashing-but-controlled color, oversized type, decorative excess done on purpose.
- **Industrial / Utilitarian** — data-dense, tabular numerics, tight grid, functional color, minimal ornament.
- **Soft / Pastel** — low-chroma pastels, rounded forms, gentle motion, playful but tasteful.
- **Art-deco / Geometric** — symmetry, gold/jewel accents, geometric ornament, display with character.

Match implementation complexity to the family: maximalist → elaborate code + animation; minimalist → restraint, precision, spacing discipline.

## AI-slop fingerprints → counters
If output drifts generic, check for and fix these:

| Fingerprint | Counter |
|---|---|
| Inter / Roboto / Arial / system / Space Grotesk | Distinctive display + refined body (Fontshare: Clash, General Sans, Cabinet Grotesk, Satoshi) |
| Purple/indigo gradient on white | Dominant brand hue + a single sharp accent (often hue+180), from tokens |
| Centered hero + single CTA | Asymmetric or editorial layout; intentional eye path |
| Three icon-boxes in a row | Marquee / alternating rows / single strong statement |
| Uniform 16px radius everywhere | A deliberate radius scale tied to component role |
| Shadows at flat 0.1 opacity | Layered/atmospheric depth, or none + borders |
| "Teal accent everywhere" (Claude tell) | Set the brand accent explicitly in DESIGN.md first |
| Container soup (>2 nesting levels) | Flatten; structure with grid, not nested wrappers |

## How to use
At `/cila:design` time, the design-director proposes directions drawn from these families and locks the choice into `DESIGN.md`. During build, if something reads generic, run this list as a checklist and fix at the token/structure level — not with surface tweaks.
