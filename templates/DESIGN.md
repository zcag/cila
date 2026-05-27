<!--
  DESIGN.md — the locked design contract for this project.
  Written/updated by `/cila:design`. cila re-reads this every session, so it is the
  source of truth that stops the model drifting back to generic defaults.
  Edit deliberately. Replace every <…> placeholder. Keep it tight.
-->

# Design Contract — <Project>

## Aesthetic Direction
- **Tone:** <one committed extreme — e.g. editorial/magazine · brutalist/raw · luxury/refined · retro-futuristic · organic · maximalist>
- **One-line intent:** <what makes this interface unforgettable>
- **Brand origin:** <2–3 sentences: who it's for, the feeling, the world it lives in>

## Negative Constraints (never)
- No Inter / Roboto / Arial / system-ui / Space Grotesk.
- No purple/indigo gradients on white.
- No centered-hero + single-CTA cliché; no three-icon-box feature grid.
- No uniform 16px radius on everything; no shadows at flat 0.1 opacity.
- Containers nest ≤ 2 levels.
- <project-specific don'ts>

## Color  (OKLCH — see `src/styles/tokens.css`)
- **Brand hue:** `--brand-hue: <deg>` (the single knob the whole palette derives from)
- **Roles:** brand `<…>` · accent `<… (often hue+180)>` · bg `<…>` · fg `<…>` · muted `<…>` · border `<…>`
- Dominant color + sharp accent (not a timid even palette). Light + dark both defined.
- Contrast floors: text ≥ 4.5:1, UI/non-text ≥ 3:1.

## Typography
- **Display:** <font> — <source, e.g. `@fontsource-variable/<x>`>
- **Body:** <font> — <source>
- **Scale:** <modular ratio or explicit rem steps>; size jumps ≥ 3×.
- **Weights:** use extremes (e.g. 300 / 800), not adjacents.

## Spacing & Layout
- Base grid: **4px**. Rhythm: <…>
- Composition: <asymmetry / overlap / diagonal flow / grid-breaking notes>

## Motion
- **Signature moment:** <one orchestrated reveal — e.g. staggered hero entrance>
- Library: `motion/react` (or CSS-only for static HTML). Animate **transform/opacity only**.
- UI transitions < 300ms. Always guarded by `prefers-reduced-motion`.

## Backgrounds / Atmosphere
- <gradient mesh / grain / geometric pattern / layered depth> — generated as raw CSS/SVG.

## Components
- Base: `@shadcn`. Premium lanes: <e.g. `@tailark` structure · `@aceternity` hero · `@magicui` motion>.
- **Reuse before creating.** Ownership lanes: <which registry owns what, to avoid overlap>.

## Tokens
- Source of truth: `src/styles/tokens.css` (Tailwind v4 `@theme`, OKLCH).
- Three tiers: primitive → semantic → component. Components reference **semantic** tokens, never raw values.
- One knob: `--brand-hue`.
