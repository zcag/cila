---
name: icons
description: Choose and wire icons well — discover by intent via the Iconify API, install ONE distinctive set (Phosphor/Lucide/Tabler) for the build. Use when a UI needs icons; avoids the generic Lucide-everywhere look.
---

# Icons

## Discover (by intent, keyless)
**Iconify HTTP API** spans 200k+ icons across 200+ sets — `GET https://api.iconify.design/{prefix}/{name}.svg?color=...&height=auto` for raw SVG, or search the Iconify catalogue to find the right glyph across sets. No key, no MCP needed (an Iconify MCP is an optional convenience the user can wire).

## Build (tree-shaken npm sets)
Install ONE set that matches the `DESIGN.md` tone, rather than mixing:
- **Phosphor** (`@phosphor-icons/react`) — most character, 6 weights incl. duotone (warm/expressive).
- **Lucide** (`lucide-react`) — clean default (but don't default *everywhere* — that's an AI-slop tell).
- **Tabler** (`@tabler/icons-react`) — crisp 2px outline.
- **Hugeicons** — widest variety.

## Rules
- Pick a set that fits the aesthetic; commit to it. Size + stroke from the type scale; color from tokens.
- Decorative icons `aria-hidden`; icon-only buttons get an `aria-label`. (The a11y gate enforces this.)
