---
name: inspiration
description: Pull real award-tier design references to anchor a build — raises the creative ceiling and kills generic output. Drives the Steel browser to screenshot curated galleries; supports opt-in Mobbin and offline datasets. Use during the design/explore step or when the user says "make it like X" or wants something standout.
---

# Inspiration retrieval

Anchor on real world-class design *before* designing — the highest-leverage anti-slop / pro-wow move. **Decompose the concept; never replicate** (hand off to `reference-extract`).

## Free path (default) — the Steel browser
cila has a self-hosted **Steel MCP**. Use it to screenshot specific reference pages on demand, then decompose:
1. Navigate to a targeted gallery or detail page and screenshot it (don't crawl — hit specific URLs).
2. Extract the *concept*: palette → OKLCH, type pairing + scale, spacing rhythm, layout composition, the one memorable gesture.
3. Feed it as a seed to `design-director` / `explore` ("use this composition/feel, apply our system").

Curated starting points (expand per project, by page type):
- **Awwwards** (`awwwards.com/websites/<category>`), **Godly** (`godly.website`), **Land-book**, **SiteInspire**, **Refero** (`refero.design`) for SaaS/web.

Cap ~3–4 reference images per generation (vision tokens ~3×); pull color early, component detail later.

## Opt-in — Mobbin (paid) and datasets
- **Mobbin MCP** (600k+ real app screens) if the user has a plan — official `mobbin.com/mcp` (OAuth) → `mobbin_search_screens/flows/get_screen_detail`; or the free unofficial `pdcolandrea/mobbin-mcp`. See `docs/INTEGRATIONS.md`.
- **Offline datasets** — WebSight (823k screenshot↔HTML pairs) / Vision2UI on HuggingFace, for pattern lookup when galleries/network aren't available.

## Output
A decomposed concept + a note of what's *borrowed composition* vs *our system*. Never ship a reference's brand — only its design language.
