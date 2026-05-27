---
name: explore
description: Best-of-N design exploration — build several genuinely distinct directions in parallel as real rendered pages, judge them on screenshots, and let the user pick the winner. Use for high-stakes heroes, "show me options / variations", or maximum-wow briefs where one shot isn't enough.
---

# Explore — best-of-N

The biggest lever from "distinctive" to "surprising": don't commit to one direction on paper — **build a few for real and pick from rendered pixels.** Research shows multi-candidate generation + screenshot-grounded selection beats single-pass.

Use when: the user wants options, a flagship/high-stakes hero, or explicitly "jaw-dropping". For simple asks, the single-direction flow in `/cila:go` is enough — don't burn the budget here by default.

## Flow

### 1. Seed N distinct directions (default N = 3)
With `design-director`, generate N directions that span **different regions of design space**, not variations of one:
- Verbalized sampling (propose more than N, with self-estimated fit) → then **max-min select** the most *distinct* N (different aesthetic family, type pairing, signature moment, `--brand-hue`).
- Seed each with an explicit family/persona (e.g. editorial · brutalist · luxury-immersive) so divergence is structural, not cosmetic.
- All share the same brief + brand constraints; they differ in *interpretation*.

### 2. Fan out — one worktree per candidate
For each seed `i`:
```
git worktree add ../<repo>-cand-$i -b cila/explore/cand-$i
```
Spawn a **design-explorer** subagent per worktree, each given its seed + the worktree path. They build in **parallel** (≈ constant wall-clock; cost is ~N× build tokens). Each runs its candidate on its own dev-server port and writes `RESULTS.md`. *Optional:* generate one candidate via an architecturally-different backend (v0 Platform API, opt-in — see `docs/INTEGRATIONS.md`) for extra diversity in the pool.

### 2b. Check *realized* divergence (selection-by-quality-alone causes premature convergence)
Persona-seeded diversity is a hypothesis — verify it in the *built* result, not the pre-build estimate. Extract a cheap feature vector per candidate (`--brand-hue` + palette, type pairing, layout archetype, motion/wow signature) from each `tokens.css` + DOM and confirm the candidates are actually distinct. If two converged during the build, **drop or re-seed one** — don't waste judging on near-identical pages. Select the pool on the quality-**diversity** front, not quality alone.

### 3. Judge — pairwise tournament on screenshots (selection, not the gate)
Hand the candidates to **design-reviewer in pairwise mode**: screenshot each (Playwright), reject any that fail render-health, then run pairwise "A vs B — which better realizes the brief + DESIGN.md?" matches → Elo/ranking. Bias hygiene: **randomize A/B order, critique-before-score, the explorers never judge their own work.** Output a ranked shortlist with the deciding reasons. (Reserve a multi-judge tie-break only if the top two are within a hair.)

### 4. Human picks (the one real decision)
Present the **top 2–3 as screenshots** with one line each on what makes them distinct. The user chooses (or asks to remix two). Taste is theirs.

### 5. Refine the winner, discard the rest
Merge the winning branch to main; **strictly-better acceptance** while refining (a change only sticks if it scores higher with no new structural failures). Then run the normal `design-reviewer` gate pass. Clean up:
```
git worktree remove ../<repo>-cand-$i   # for the losers
git branch -D cila/explore/cand-$i
```

## Cost / guardrails
- **Vision tokens (~3×) dominate the *judging*, not the building** — keep **N = 3**, screenshot once per candidate at the decision viewport, reserve multi-timepoint/multi-judge for tie-breaks.
- Every candidate must be a **real, gate-able page** — diversity never excuses broken or inaccessible output.
- This is exploration; the production gates still apply to the winner before it ships.
