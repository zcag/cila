# cila-Bench — a private, dev-time design-quality benchmark

cila-Bench is how cila measures whether it's getting **better at design over time** — by running on its
**own output**, in development, never on a deployed site or a real user. It is the keystone of the
"moat": without a scoreboard, "self-improving" is unfalsifiable. (Modeled on **UI-Bench**.)

> **Scope (locked, `docs/DECISIONS.md` `[scope]`):** build-time only. cila-Bench measures cila's
> *dev output* against a frozen brief set. There is **no** production analytics, RUM, live A/B, or
> conversion signal anywhere in here. The improvement signal is the user's edits (see
> `skills/taste`) + this benchmark — never deployed telemetry.

## Why pairwise, never absolute
Honest 2026 finding: MLLM judges *rank* design adequately (Pearson ~0.7) but **score poorly in
absolute terms**, and are weakest exactly on aesthetics/emotion. So cila-Bench is **pairwise only** —
"A vs B, which better realizes this brief?" — aggregated into an **Elo / Bradley–Terry** rating.
There is no 1–10 score anywhere. A rising rating for the latest `cila@vN` = cila improved.

## The three parts
1. **A frozen brief set** — `briefs/*.md`, ~9 realistic one-paragraph briefs spanning page types
   (SaaS landing, portfolio, editorial/marketing, docs home, app dashboard, e-commerce PDP, agency
   home, pricing, event). **Frozen**: editing a brief breaks cross-round comparison — add new briefs
   as a new set, never mutate old ones.
2. **A Claude pairwise judge with bias hygiene** — `judge.md`. Given two rendered pages built from the
   *same* brief (+ their `DESIGN.md`/`CONTENT.md` + screenshots), it cites evidence, critiques
   **before** scoring, with **randomized A/B order**, blind authorship, a position-swap consistency
   check, and explicit no-length-credit. Default judge is **Claude** (keyless, runs as a subagent in
   its own context). Emits a per-match verdict → one row of `results.json`.
3. **A human-rated holdout (the honesty anchor)** — you (the maintainer) rate ~10 of the briefs
   yourself, pairwise, once, and store those verdicts as the gold reference. The auto-judge's
   **agreement with your verdicts** on the holdout is the trust metric. If the Elo moves but the
   holdout agreement drops, the judge is being gamed — fix the judge, don't ship the number. LLM
   judges + your eyes + (opt-in) a cross-family judge are the taste-axis guards.

## Cross-family judge (opt-in upgrade)
The generator is Claude, and a same-family judge has measurable self-preference + preference-leakage.
The stronger honesty guard is to route judging to a **different model family** via API. This is an
**opt-in** upgrade because it needs an API key — keep the **default keyless/Claude**, gate the
cross-family judge behind an env var, document the key in `docs/INTEGRATIONS.md`, and fall back to the
Claude judge when it's unset. Use it especially when a non-Claude baseline (v0/Bolt/Lovable) is in the
pool.

## Files
- `briefs/*.md` — the frozen brief set.
- `judge.md` — the pairwise judge protocol (prompt/subagent spec).
- `elo.mjs` — runnable Node script: reads `results.json`, computes Elo (default) or Bradley–Terry
  (`--bt`), prints a ranked leaderboard. Try it: `node bench/elo.mjs` (uses `results.sample.json`).
- `results.sample.json` — a runnable demo match log (`[{a,b,winner,brief,criterion}]`).
- `results.json` — the real, **append-only**, chronological match log (created by a run; gitignore the
  large `runs/` working area). Elo is order-sensitive, so append, don't rewrite.
- `run.md` — how a round runs end-to-end (build each brief via cila → screenshot → pairwise-judge vs
  the previous cila version / a baseline → append → recompute Elo).

## Quick start
```bash
node bench/elo.mjs                       # demo leaderboard from results.sample.json
node bench/elo.mjs bench/results.json    # your real run
node bench/elo.mjs bench/results.json --bt   # Bradley–Terry (the published number)
```
Then read `run.md` to execute a real round, and `judge.md` for the judging discipline.

## The honesty guards (all load-bearing)
Cross-family judging (opt-in) · blind + position-swapped pairwise · critique-before-score · a frozen
human-rated holdout · a frozen (never-mutated) brief set · same build budget across versions.
Goodhart, self-preference, and rubric-gaming are real and documented (`docs/RESEARCH-FRONTIER.md`
Theme A). The human holdout is the circuit breaker.
