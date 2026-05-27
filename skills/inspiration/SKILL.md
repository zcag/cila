---
name: inspiration
description: Find real award-tier design references to anchor a build when none is given yet — raises the creative ceiling and kills generic output. Drives a browser MCP (Steel/Playwright) to screenshot curated galleries; supports opt-in Mobbin and offline datasets. Use during the design/explore step to source references. (If the user already has a specific reference, use reference-extract instead.)
---

# Inspiration retrieval

Anchor on real world-class design *before* designing — the highest-leverage anti-slop / pro-wow move. **Decompose the concept; never replicate** (hand off to `reference-extract`).

## Free path (default) — a browser MCP
Use a browser MCP (a self-hosted **Steel**, or the **Playwright** MCP) to screenshot specific reference pages on demand, then decompose:
- **If no browser MCP is configured:** do **not** silently fall back to `WebFetch` (gallery pages are JS-rendered → near-useless HTML). Tell the user this capability needs a browser MCP and offer to help wire one (Steel, or `@playwright/mcp`); meanwhile work from the user's own reference or a described direction.
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
