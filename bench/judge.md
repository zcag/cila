# cila-Bench — pairwise judge protocol

A prompt/subagent spec for the **pairwise design-quality judge**. It does ONE thing: given two
rendered pages built from the *same* brief, decide which better realizes that brief — with bias
hygiene and cited evidence. It never assigns an absolute score (MLLM judges score design poorly in
absolute terms; they only *rank* adequately — UI-Bench, MLLM-as-UI-Judge), and it never builds.

This is the bench-time sibling of `design-reviewer`'s "Pairwise mode": same discipline, but here it
runs over the **frozen brief set** comparing cila versions / baselines, to produce `results.json` for
`elo.mjs`. It is a measurement of cila's *own output in dev* — not of any live site or user.

## Inputs (per match)
- The **brief** (`bench/briefs/<id>.md`) — the rubric. The page is judged against *this*, not taste in a vacuum.
- The two candidates' **`DESIGN.md` + `CONTENT.md`** (their declared intent — judge realization, not just pixels).
- **Screenshots** of each candidate across the decision matrix: **360 / 1024 / 1440**, **light + dark**, plus any state the brief calls for (empty/loading for the dashboard, hover/focus where relevant). Same shots for both.
- Optional: the **human-rated holdout** verdict for this brief (when present, used only to *audit* the judge offline — never shown to it during judging).

## Bias hygiene (load-bearing — do these or the numbers lie)
1. **Blind authorship.** Candidates are presented as **A** and **B** only. Never reveal which is cila / which version / which is v0. Strip version strings from filenames before handing over.
2. **Randomized A/B order, per match.** The caller (`run.md`) shuffles which candidate is A. Self-preference and position bias are both real and persist even when authorship is hidden — randomization is the cheap defense.
3. **Consistency check (position-swap).** For the gate-deciding briefs, run the same pair *twice* with A/B swapped; if the winner flips, record `tie` (the judge isn't actually distinguishing them). Cheap insurance against position bias.
4. **No length/verbosity credit.** More sections / more copy is not better. Judge fit-to-brief and craft, explicitly penalize bloat.
5. **Critique before score.** Write the evidence and critique *first*, then name the winner. Naming a winner first and rationalizing backwards is the main failure mode.
6. **Self-model watch.** Once a non-Claude candidate (v0/Bolt/Lovable) enters the pool, note that a Claude judge may under-rate non-Claude work; this is exactly what the **cross-family judge** (opt-in, below) and the **human holdout** exist to catch.

## Criteria (judge each pairwise; the brief weights them)
Mirror `design-reviewer`'s axes, applied comparatively:
- **Brief fit** — which page actually delivers what *this brief* asked for (the right sections, the core message landed, the called-for states present)?
- **Design quality** — committed tone, hierarchy, spacing, color use; does it look intentional?
- **Originality** — which better avoids the AI-slop signature (Inter, purple-on-white, three-box grid, uniform radius, centered-hero cliché)?
- **Craft** — typography detail, alignment, responsive composition, state polish, micro-details.
- **Content & message** — 5-second clarity, specificity/falsifiability of the headline, "So what?" per section, kill-list clean, scannability, one clear CTA.

## Protocol (per match)
1. **Render-health first.** If either candidate is broken/blank/error at any viewport, it loses that match outright (no aesthetic judging of a broken page); record and move on.
2. **Per-criterion comparison, evidence-cited.** For each criterion, cite the *specific region/element* in A and in B ("A's hero `<h1>` sits off the 4px grid and reads generic; B front-loads the drift-catch proof above the fold"). Then state which wins that criterion, or *tie*.
3. **Overall winner.** Weigh the criteria by what the brief stressed (e.g. editorial → typography/pacing; dashboard → hierarchy/scannability; event → signature moment). Decide **A**, **B**, or **tie**. Ties are legitimate — force-picking adds noise.
4. **Emit the verdict** (below). One line per match goes into `results.json`.

## Output (verdict)
```json
{
  "brief": "saas-landing",
  "criterion": "overall",
  "winner": "a",
  "evidence": {
    "brief_fit":    { "win": "a", "why": "A lands the conformance message + shows a before/after catch; B buries it." },
    "design_quality": { "win": "a", "why": "..." },
    "originality":  { "win": "b", "why": "B's type pairing is bolder; A leans default." },
    "craft":        { "win": "a", "why": "..." },
    "content":      { "win": "tie", "why": "..." }
  },
  "swap_consistent": true,
  "note": "A wins overall on brief-fit + craft despite B's stronger type."
}
```
The harness maps A/B back to real competitor ids (using the shuffle key it kept) and appends
`{ a, b, winner, brief, criterion }` to `results.json`. Per-criterion rows can also be appended
(`criterion: "originality"`, etc.) to get per-axis leaderboards from `elo.mjs`.

## Default judge vs cross-family (opt-in)
- **Default (keyless):** the judge is **Claude**, run as a subagent in its own context — no API key, works out of the box. Bias hygiene above + the human holdout keep it honest enough for tracking *relative* progress of cila-vs-itself.
- **Cross-family (opt-in upgrade, needs a key):** route judging to a **different model family** via API (the generator is Claude; a same-family judge has measurable self-preference and preference-leakage). This is the stronger honesty guard for cila-vs-baselines. It is **not** default because it requires a key — document it in `docs/INTEGRATIONS.md`, gate it behind an env var, fall back to the Claude judge when unset.
- **Human holdout (the anchor):** ~10 briefs are *also* rated by a human (see `README.md`). The auto-judge's agreement with the human verdicts on those is the trust metric. If they diverge, the leaderboard is suspect — fix the judge, don't ship the number.
