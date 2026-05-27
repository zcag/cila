---
name: hero-art
description: Generate bespoke, on-brand AI hero imagery, seamless textures, abstract backdrops, and OG/social images for jaw-dropping pages — then optimize and wire them to pass cila's perf + a11y gates. OPTIONAL and key-gated (the user supplies their own image-gen API key); without a key, fall back to shaders/3D/CSS + Pexels stock. Use when a build wants custom focal art / textures / OG images and the user has opted in to an image-gen provider.
---

# Hero Art — bespoke AI imagery (opt-in, key-gated)

cila is free by default. AI art is a **Phase-3 wow enhancement, never required.** It needs a paid image-gen key the *user* supplies. **The plugin's `.mcp.json` must NOT carry a key-requiring server** — this skill documents the opt-in wiring instead. No key → take the free fallback path below; the page is still gorgeous.

## When AI art (vs shaders/3D/CSS/stock)
Slots into the `wow` tiers. Pick the *lightest* thing that delivers the concept.

| Use AI art for | Use instead |
|---|---|
| **Bespoke hero focal imagery** (a subject/scene that *is* the page) | Abstract atmosphere → **shaders** (Tier 2) / **CSS mesh-gradient** (Tier 1) — free, animated, token-driven |
| **Seamless tileable textures/patterns** (paper, fabric, terrain, noise fields) | Cheap grain/dots/lines → SVG `feTurbulence` / CSS (`templates/wow/css/Grain`) |
| **Abstract backdrops** where a *specific look* (not motion) is wanted | Motion/depth wanted → shaders/`r3f`, not a static image |
| **OG / social share images** (1200×630, no live render available) | — (this is AI art's strongest, lowest-risk slot) |
| Generic photographic content (people, product, place) | **Pexels API** stock (free, no hotlink mandate) — cheaper, faster, legally clean |
| **Never:** icons, logos, UI chrome, diagrams, charts | Iconify / SVG / component libs — AI raster art is wrong here |

Rule of thumb: **bespoke focal art or OG image → AI; ambient/animated → shaders/CSS; real-world photo → Pexels.** Bespoke beats stock for a signature hero, but only when it's truly the focal point.

## Providers + opt-in wiring (user supplies the key)
The user adds the MCP to **their own** config (`claude mcp add`, user or project scope) — not cila's `.mcp.json`. Export the key in their shell/`.env` first. Best text-in-image → Nano Banana; cheapest fast iterations → fal Flux; widest model menu → Replicate.

```bash
# Nano Banana / Gemini image (best text-in-image, e.g. wordmarks on art)
export GEMINI_API_KEY=...        # aistudio.google.com
claude mcp add image -- npx -y @shinpr/mcp-image

# fal.ai (Flux dev/schnell — fast, cheap iterations)
export FAL_KEY=...               # fal.ai/dashboard/keys
claude mcp add fal -- npx -y mcp-fal-ai-image

# Replicate (Flux + a huge model menu)
export REPLICATE_API_TOKEN=...   # replicate.com/account/api-tokens
claude mcp add replicate -- npx -y mcp-replicate
```

Then `/mcp` to confirm it's connected. **Free fallback (no key):** stay on the `wow` Tier-1/Tier-2 stack — CSS mesh-gradient + grain, GLSL shaders (`shaders` skill), R3F 3D (`r3f` skill), all brand-tuned and key-free — and use the **Pexels API** (`PEXELS_API_KEY`, free) for photographic needs. Never block a build on a missing image key.

## On-brand prompting (anchor to DESIGN.md + tokens)
Generic prompt → generic AI-slop art. Anchor every generation to the project's `DESIGN.md` aesthetic and the brand palette, and request a *direction*, not "a nice image".

- **Inject brand color** — resolve `--brand-hue` (+ accent at `hue+180`) from `tokens.css` to hex/named hues and name them in the prompt: `"dominant deep-violet (#5b21b6) field, single warm-amber accent"`. Keeps art on-system.
- **Carry the committed tone** from `DESIGN.md` (e.g. editorial / brutalist / organic / luxury) + 3–5 mood/style keywords + medium (`risograph print`, `liquid-chrome render`, `long-exposure light`, `hand-marbled paper`).
- **Aspect ratio per slot:** hero `16:9` (1920×1080) or cinematic `21:9` (2560×1080); section backdrop `4:5`/`3:4`; **OG `1200×630` (1.91:1)**; texture **square + explicitly "seamless, tileable, edge-to-edge, no border, no vignette"**.
- **Negative prompt (kill the AI look):** `no text, no watermark, no logo, no faces, no stock-photo lighting, no lens flare, no oversaturated gradient, no generic 3D-render sheen, no purple-to-blue cliché, no centered subject, no busy clutter`. (Drop `no text` for OG images that need a wordmark — let Nano Banana place it.)
- **Verbalized sampling for options:** ask the provider for **2–3 distinct directions** (vary medium/composition/palette emphasis), not one image — see the example flow.

## Post-processing with `sharp` (agent-runnable)
Source the model output at high res, then derive a responsive set. `npx` so no install needed.

```bash
npx -y sharp-cli@latest -i hero-src.png -o public/img/hero-1920.avif resize 1920 --format avif --quality 55
# Responsive widths → AVIF (smallest) + WebP fallback:
for w in 640 960 1280 1920 2560; do
  npx -y sharp-cli -i hero-src.png -o public/img/hero-$w.avif  resize $w --format avif --quality 55
  npx -y sharp-cli -i hero-src.png -o public/img/hero-$w.webp  resize $w --format webp --quality 72
done
```
Or, in a one-off Node script (more control — strip metadata, tune effort):
```js
import sharp from "sharp";
const widths = [640, 960, 1280, 1920, 2560];
for (const w of widths) {
  const img = sharp("hero-src.png").resize(w).withMetadata({});
  await img.clone().avif({ quality: 55, effort: 6 }).toFile(`public/img/hero-${w}.avif`);
  await img.clone().webp({ quality: 72 }).toFile(`public/img/hero-${w}.webp`);
}
// Seamless texture → small tile, repeat in CSS (background-repeat). OG → fixed 1200×630.
await sharp("og-src.png").resize(1200, 630, { fit: "cover" }).webp({ quality: 80 }).toFile("public/img/og.webp");
```
Output sizes per breakpoint: ship `640/960/1280/1920` (+`2560` for retina hero) as `srcset`. AVIF first, WebP fallback. Keep each variant in budget (AVIF hero ~80–150KB; OG ~<300KB). Textures: export *one small tile* and CSS-repeat — never a full-bleed raster.

## Perf + a11y (must pass cila's gates)
A hero image is usually the **LCP element** — treat it as performance-critical:
- **Preload + high priority**, never lazy-load the LCP image:
  ```html
  <link rel="preload" as="image" href="/img/hero-1280.avif"
        imagesrcset="/img/hero-640.avif 640w, /img/hero-960.avif 960w, /img/hero-1280.avif 1280w, /img/hero-1920.avif 1920w"
        imagesizes="100vw" type="image/avif">
  ```
  ```html
  <picture>
    <source type="image/avif" srcset="/img/hero-640.avif 640w, /img/hero-960.avif 960w, /img/hero-1280.avif 1280w, /img/hero-1920.avif 1920w" sizes="100vw">
    <img src="/img/hero-1280.webp"
         srcset="/img/hero-640.webp 640w, /img/hero-960.webp 960w, /img/hero-1280.webp 1280w, /img/hero-1920.webp 1920w" sizes="100vw"
         width="1920" height="1080" fetchpriority="high" decoding="async"
         alt="Aurora-like violet light folding over a dark horizon">
  </picture>
  ```
- **No CLS:** always set explicit `width`/`height` (or `aspect-ratio`) so the box is reserved before paint — CLS is a strict gate even on showcase pages.
- **`fetchpriority="high"`** on the LCP `<img>`; **never** `loading="lazy"` on it (lazy-load only below-fold art).
- **Meaningful `alt`** for content imagery (describe the scene, not "hero image"). **Decorative backdrops/textures** → `alt=""` + `aria-hidden="true"` and put them in CSS `background`, not `<img>`.
- **Budget:** AVIF + responsive `srcset` keeps the LCP byte cost inside cila's perf budget; oversized PNGs fail it. Self-host under `public/img/` (no third-party hotlink).
- Then gate via **`design-reviewer`** (showcase perf profile, strict a11y/CLS) — same as any wow build.

## Example flow
1. **Brief** — read `DESIGN.md` for the committed tone + resolve `--brand-hue`/accent from `tokens.css`. Confirm an image-gen key is wired (else fall back to shaders/CSS + Pexels and stop here).
2. **Generate 2–3 on-brand options** — one prompt per direction (vary medium/composition), brand colors named, slot aspect ratio set, negative prompt applied. E.g. hero `21:9`: *"abstract liquid-chrome field, dominant deep-violet #5b21b6 with one warm-amber accent ribbon, editorial, high-contrast, cinematic depth — no text, no faces, no generic render sheen, off-center composition"*.
3. **Pick** — eyeball the 2–3 against `DESIGN.md`; keep the highest-res winner as `hero-src.png`.
4. **Optimize** — run the `sharp` loop → AVIF+WebP responsive set under `public/img/`; OG → fixed 1200×630.
5. **Wire** — `<link rel=preload as=image fetchpriority>` + `<picture>` with `srcset`/`sizes`, explicit `width`/`height`, meaningful `alt` (or `aria-hidden` if decorative); add `<meta property="og:image">` pointing at `/img/og.webp`.
6. **Gate** — `design-reviewer` (showcase profile, strict CLS/a11y); iterate until LCP + CLS pass.
