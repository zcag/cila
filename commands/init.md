---
description: Scaffold the current repo as a cila project — tokens, starter, gates, components.json, and a CLAUDE.md pointer.
argument-hint: [optional: "marketing" | "app"]
---

Materialize cila into **this repo** so any agent that opens it inherits the rig.

Steps:

1. **Pick the stack.** From `$ARGUMENTS` or by inspecting the repo: **marketing/landing → Astro + Tailwind v4 + Cloudflare** (default); **app/dashboard → Next.js + Tailwind v4**. (Phase 1 ships the Astro starter; if Next is requested and `${CLAUDE_PLUGIN_ROOT}/templates/next-starter` doesn't exist yet, say so and offer Astro or a minimal manual Next setup.)

2. **Scaffold (only if the repo is empty/fresh).** Copy `${CLAUDE_PLUGIN_ROOT}/templates/astro-starter/` into the repo. If the repo already has an app, don't overwrite — only add the missing pieces below.

3. **Design contract & tokens.** If `DESIGN.md` already exists (from `/cila:design`), keep it and make sure `src/styles/tokens.css` matches its `--brand-hue` and palette. If neither exists, tell the user to run `/cila:design` first (don't invent a contract here).

4. **Wire components.** Ensure `components.json` registers `@shadcn` plus the free premium registries (`@magicui @aceternity @origin @cult @reactbits`). Components are pulled later via the shadcn MCP / `npx shadcn add @ns/<item>`.

5. **Install gates.** Copy `${CLAUDE_PLUGIN_ROOT}/templates/gates/` in and merge its `package.json` scripts (`gate`, `gate:a11y`, `gate:layout`, `gate:tokens`, `gate:visual`, `gate:lh`) and devDependencies into the project's `package.json`. Point the gates' `BASE_URL` at this project's dev server.

6. **Write the pointer.** Create/append `CLAUDE.md` with: *"This repo is cila-enabled. `DESIGN.md` is the design contract — honor it. Build UI via the design-reviewer loop (`/cila:review`). Run `npm run gate` before shipping; structural gates are hard fails."*

7. **Report** the files added/changed and the next command (`npm install`, then build, then `/cila:review`).

Do not run `npm install` or builds unless the user asks.
