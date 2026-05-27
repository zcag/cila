---
name: inspiration
description: Source real award-tier design references AND decompose them into reusable tokens/patterns — raises the creative ceiling and kills generic output. Drives a browser MCP (Steel/Playwright) to screenshot curated galleries when none is given, and decomposes a reference the user provides (URL/screenshot). Use during the design step whenever you need to anchor on or break down references, or the user says "make it like X".
---

# Inspiration retrieval

Anchor on real world-class design *before* designing — the highest-leverage anti-slop / pro-wow move. **Decompose the concept; never replicate.**

## Free path (default) — a browser MCP
Use a browser MCP (a self-hosted **Steel**, or the **Playwright** MCP) to screenshot specific reference pages on demand, then decompose:
- **If no browser MCP is configured:** do **not** silently fall back to `WebFetch` (gallery pages are JS-rendered → near-useless HTML). Tell the user this capability needs a browser MCP and offer to help wire one (Steel, or `@playwright/mcp`); meanwhile work from the user's own reference or a described direction.
1. Navigate to a targeted gallery or detail page and screenshot it (don't crawl — hit specific URLs).
2. Extract the *concept*: palette → OKLCH, type pairing + scale, spacing rhythm, layout composition, the one memorable gesture.
3. Feed it as a seed to `design-director` ("use this composition/feel, apply our system").

Curated starting points (expand per project, by page type):
- **Awwwards** (`awwwards.com/websites/<category>`), **Godly** (`godly.website`), **Land-book**, **SiteInspire**, **Refero** (`refero.design`) for SaaS/web.

Cap ~3–4 reference images per generation (vision tokens ~3×); pull color early, component detail later.

## From a reference the user gives (URL / screenshot) — decompose, never replicate
- **URL, deterministic first:** `npx brandmd <url>` (→ DESIGN.md + CSS vars, no LLM) or `design-extract` (→ DTCG tokens) if available; else WebFetch the page's CSS/computed styles, or screenshot it via the browser MCP.
- **Screenshot → extract by dimension**, one at a time: **Color** → primary/secondary/accent as hex → OKLCH + a `--brand-hue`; **Type** → families, the display/body pairing, scale + weights; **Spacing** → rhythm + grid base; **Layout** → the composition (asymmetry, density, eye path) — borrow this, not the pixels.
- Write the extracted system into `DESIGN.md` + `tokens.css` (via the **design-tokens** skill). Keep what's distinctive; drop the reference's brand. Note which choices are *borrowed composition* vs *our system*.

## Opt-in — Mobbin (paid) and datasets
- **Mobbin MCP** (600k+ real app screens) if the user has a plan — official `mobbin.com/mcp` (OAuth) → `mobbin_search_screens/flows/get_screen_detail`; or the free unofficial `pdcolandrea/mobbin-mcp`. See `docs/INTEGRATIONS.md`.
- **Offline datasets** — WebSight (823k screenshot↔HTML pairs) / Vision2UI on HuggingFace, for pattern lookup when galleries/network aren't available.

## Output
A decomposed concept + a note of what's *borrowed composition* vs *our system*. Never ship a reference's brand — only its design language.
