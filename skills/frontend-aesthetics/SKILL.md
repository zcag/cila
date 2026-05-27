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

## Modern-CSS defaults (2026)
Reach for the platform before JS or libraries — these are Baseline and reduce both code and AI-slop tells (all progressive-enhancement, `@supports`-guardable):
- **Container queries over viewport breakpoints** — size components to their *container*, not the window, so they're context-portable (`@container`). Default to these; use viewport media queries only for true page-level layout shifts.
- **`:has()` over JS state toggles** — parent/sibling-aware styling (selected card, filled field, open state) with no JS class-toggling.
- **`@scope`** — bound styles to a subtree without BEM/utility-soup leakage; pairs with the component tier.
- **`@starting-style` for entrance animations** — animate elements *in* (incl. from `display:none` / `popover`) with no JS mounting hooks; guard under reduced-motion.
- **`text-wrap: balance`** on headings, **`text-wrap: pretty`** on body — kills orphans/ragged lines; an instant "designed by a human" tell, near-zero cost.
- **CSS anchor positioning** for tethered UI (tooltips, menus, popovers) — `anchor()` / `position-anchor` replaces the Floating UI dep.
- **Native `popover` / `<dialog>` / invoker commands** for overlays/menus/modals — browser-managed top layer + focus trapping + ESC/light-dismiss = an **a11y correctness win** over hand-rolled modal JS. Prefer these over a JS modal library.

## Icons (commit to ONE set — mixing is a slop tell)
Discover by intent via the keyless **Iconify** API (200k+ icons): `GET https://api.iconify.design/{prefix}/{name}.svg`. For the build, install ONE set matching the `DESIGN.md` tone, tree-shaken: **Phosphor** (`@phosphor-icons/react`, most character, duotone), **Lucide** (`lucide-react`, clean — but don't default *everywhere*, that's a tell), **Tabler** (crisp 2px outline), or **Hugeicons** (widest). Size + stroke from the type scale; color from tokens. Decorative icons `aria-hidden`; icon-only buttons get an `aria-label` (the a11y gate enforces this).

## How to use
At direction time, the design-director proposes directions drawn from these families and locks the choice into `DESIGN.md`. During build, if something reads generic, run this list as a checklist and fix at the token/structure level — not with surface tweaks.
