---
description: Run cila's visual-critique loop on the running site — screenshots, structural gates, and a critique against DESIGN.md.
argument-hint: [optional: page path or URL, e.g. "/" or "http://localhost:4321/pricing"]
---

Review the rendered UI for **${ARGUMENTS:-the running site}**.

Delegate to the **design-reviewer** subagent. It will:
1. Ensure a dev server is running and navigate to the target via the Playwright MCP.
2. **Render-health gate** → reject on build error / blank page / console errors.
3. Run the **structural gates** (`npm run gate`) — token conformance, spacing/scale, layout invariants, axe a11y (WCAG 2.2 AA), CWV budgets. Any failure = HOLD.
4. Screenshot the **matrix** (360/768/1024/1440 × light/dark × hover/focus/empty/error) and critique against `DESIGN.md` on Design / Originality / Craft / Functionality.

It returns a verdict (REJECT / HOLD / PASS), the hard failures verbatim, then ranked specific fixes. Apply the fixes, then re-run `/cila:review` until PASS. The reviewer judges — it does not edit; you make the fixes.
