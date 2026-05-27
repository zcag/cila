---
name: content-structure
description: Structure site/page content like an expert — narrative arc (StoryBrand), information architecture, scannability, content-first hierarchy, SEO, and content accessibility — and hand a content model to the visual layer. Use when planning a site's pages/sections or wiring content into layout.
---

# Content structure

## Narrative — StoryBrand SB7
Customer = hero, brand = **guide**. Arc: Character (one desire) · Problem (external/internal/philosophical — buying happens at the *internal*) · Guide (empathy + authority) · Plan (a simple 3-step) · CTA (direct + transitional) · avoid Failure (stakes, sparingly) · Success (concrete after-state). **One-liner:** *[Character] struggles with [Problem]; we provide [Plan] so they can [Success].* The homepage answers, top→bottom: **what do you offer? → how does it make my life better? → what do I do next?** Hero passes the **3-second grunt test**.

## Information architecture
IA informs the UI; nav is its expression. Tree hierarchy; global nav 5–7 items; breadcrumbs when deep. Avoid both flat and deep extremes. Per-type maps:
- **Marketing:** Home · About · Product/Services · Pricing · Work/Cases · Resources · Contact.
- **SaaS:** Home · Product/Features · Solutions (use-case/role) · Pricing · Customers · Docs · Resources · (Login + primary CTA pinned).
- **Portfolio:** Home (hero + selected work) · Work → case detail · About · Contact.
- **Docs:** sidebar tree + in-page TOC + breadcrumb + search; Diátaxis split (tutorial / how-to / reference / explanation — don't mix modes per page).
Order sections by **search intent** + the StoryBrand arc.

## Scannability (people scan, not read)
Design for the **layer-cake** pattern (heading→heading) — needs descriptive, distinct subheads; beware **false bottoms**. The **F-pattern** is a symptom of bad formatting — counteract it. **Inverted pyramid:** conclusion/value first, detail below. Front-load every level (headline, first sentence, first words, each subhead standalone). Chunk; bullets for parallel items; one idea per paragraph.

## Content-first → visual handoff
Never lorem ipsum. **Content hierarchy drives visual hierarchy.** Produce a **content model** per page: an ordered list of blocks, each with `(type, priority tier, real copy, format = paragraph/bullets/table/quote/steps)`. Hand the design layer this priority ranking so prominence maps to importance (hero = max; footer "junk drawer" = min). This is the bridge to `DESIGN.md`.

## SEO (quality-first, 2026)
People-first (who/how/why test); **E-E-A-T** as a lens (Trust at center). **Match search intent** (informational/navigational/commercial/transactional → page type; check what already ranks). On-page: unique descriptive `<title>` + meta description (snippet, not a ranking factor); one H1 + semantic headings; descriptive anchors (never "click here"); meaningful alt text; internal links mirror the IA. Emit **JSON-LD** (Organization, BreadcrumbList, Article, Product). **AI Overviews / answer engines** follow the same people-first fundamentals — see **AEO/GEO** below for question-led H2s, answer-first blocks, evidence, and the schema/FAQPage detail.

## AEO / GEO (get cited by answer engines)
Answer engines (AI Overviews, ChatGPT, Perplexity) extract and cite *passages*. Same people-first fundamentals, sharpened — and it compounds with the StoryBrand/scannability work above:
- **Question-led H2s** — phrase subheads as the real query ("How does X work?", "What does X cost?"), then put a **40–60-word answer-first block** directly under each: the complete, self-contained answer in the first sentence, detail after (the inverted pyramid, tightened for extraction).
- **Cite evidence in the copy** — Princeton GEO data: adding **expert quotes lifts visibility ~+41%**, **statistics ~+30%**, **citations to sources ~+30%** (readability ~+22%). So weave in *sourced* stats, named quotes, and outbound citations — they raise the odds of being quoted, and they're real E-E-A-T signals.
- **Emit JSON-LD schema** so machines parse entities unambiguously: **Organization** (site-wide), **Article** (editorial/blog), **BreadcrumbList** (mirrors the IA), **Product** (commerce). Keep it accurate to on-page content. **⚠ Do not target `FAQPage`** — FAQ rich results were removed from Google (May 2026); answer-first prose under question H2s is the durable play, not FAQ markup.
- Self-contained sections (no "as mentioned above"), one idea per chunk, descriptive — the same structure that wins both human scanners and extractors.

## Accessibility (converges with scannability + SEO)
Plain language / reading level (WCAG 3.1.5); alt text as content (1.1.1); descriptive links (2.4.4); real semantic heading hierarchy. Build these once — descriptive headings, descriptive links, meaningful alt, front-loaded plain language satisfy scannability, a11y, *and* SEO together.
