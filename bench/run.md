# cila-Bench — running the loop

How to run a cila-Bench round and read whether cila got better. This is a **dev-time** procedure run
by a maintainer (you), against cila's own output — not anything that touches a deployed site or a user.

A "round" = build every frozen brief with the current cila, judge each new build pairwise against a
prior cila version and/or a baseline, append the outcomes, and recompute the leaderboard. **A rising
`cila@vN` Elo across rounds is the definition of "we improved."**

## One-time setup
- Pick a `cila@vN` label for the version under test (e.g. the plugin `version` in `plugin.json`, or a git tag).
- Keep a `bench/runs/` working area (gitignored — large): `runs/<cila@vN>/<brief-id>/` holds each built page + its screenshots + the `DESIGN.md`/`CONTENT.md` it produced. Keep the prior version's builds around so they can be re-judged.
- `bench/results.json` is the **append-only** match log (chronological — Elo is order-sensitive). `bench/results.sample.json` is a runnable demo; real runs write `results.json`.

## A round, step by step
For each brief in `bench/briefs/`:

1. **Build with cila.** Run `/cila:go` against the brief text in a clean scratch repo, *non-interactively as far as possible* — feed the brief as `$ARGUMENTS`, accept the default direction (no human steering, so the comparison is apples-to-apples across versions). Let it run its normal stages including the gates. Save the result under `runs/<cila@vN>/<brief-id>/`.
   - Briefs name their stack (Astro / Next). Honor it.
2. **Screenshot.** Start the dev server; capture the decision matrix from `judge.md` (**360 / 1024 / 1440 × light + dark**, plus any brief-specific state). Same shots you'll capture for the opponent. (Reuse `design-reviewer`'s Playwright path.)
3. **Pick the opponent(s).** Always judge against:
   - the **previous cila version** on the same brief (the "did we improve?" signal), and
   - optionally a **baseline** (`v0` / `bolt` / `lovable` export, or a frozen `cila@v0` first-cut) on the same brief (the "are we good?" signal).
4. **Judge pairwise** (`judge.md`). Hand the two candidates' screenshots + `DESIGN.md`/`CONTENT.md` + the brief to the pairwise judge. **Shuffle which is A**; keep the shuffle key. For gate-deciding briefs, run the position-swap consistency check.
5. **Append the outcome.** Map A/B back to real ids and append one line to `bench/results.json`:
   ```json
   { "brief": "saas-landing", "a": "cila@v4", "b": "cila@v3", "winner": "a", "criterion": "overall" }
   ```
   (Append per-criterion rows too if you want per-axis boards.)

## Recompute & read
```bash
node bench/elo.mjs bench/results.json          # Elo leaderboard (streaming, order-sensitive)
node bench/elo.mjs bench/results.json --bt     # Bradley–Terry (batch MLE — the published number)
```
- **Did we improve?** `cila@vN` ranks above `cila@v(N-1)`, ideally by a margin that survives the next round. Look at the **per-brief** breakdown too — a global rise that hides a regression on, say, `app-dashboard` is worth knowing.
- Use **Bradley–Terry** for the headline leaderboard (order-independent, the honest re-rating of the whole corpus); Elo is fine for watching a single round stream in.

## The honesty anchor (run periodically, not every round)
- Re-judge the **human-rated holdout** briefs (~10, see `README.md`) with the auto-judge and check agreement with the stored human verdicts. High agreement → trust the leaderboard. Divergence → the judge is gaming/biased; fix `judge.md` before believing any Elo move.
- When a non-Claude baseline is in the pool, prefer the **cross-family judge** (opt-in) for those matches, and weight the human holdout more.

## Guardrails (so the number stays meaningful)
- **Freeze the brief set.** Editing briefs mid-track invalidates cross-round comparison. Add new briefs as a *new* frozen set; don't mutate old ones.
- **Same build budget across versions** (N for best-of-N, screenshot count, judging depth) — otherwise you're measuring spend, not taste.
- **No human steering during bench builds** — bench measures the *default* output, the thing that ships when the user doesn't art-direct.
- **Goodhart watch:** if cila starts winning the bench but the human holdout stops agreeing, the loop is overfitting the judge. The holdout is the circuit breaker.
- Strictly dev-time: nothing here deploys, instruments, or reads a live site. The only inputs are the frozen briefs and cila's own builds.
