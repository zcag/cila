---
name: taste
description: cila's self-writing taste memory. After the user EDITS cila's generated UI/copy, infer a one-line natural-language preference (style vs content), store it keyed by context, and retrieve the nearest ones into future design/build steps — so cila stops repeating the same correction. Also maintains a curated bank of shipped, high-scoring exemplars for few-shot reuse. Use whenever the user edits generated output, says "remember"/"learn"/"always do X"/"stop doing Y" about how cila builds, or asks to apply their saved preferences. Loaded at SessionStart; read by design-director and content-strategist.
---

# Taste — learning from edits (CIPHER-style)

cila's signature compounding feature: a `taste/` profile that **writes itself from the user's edits**.
When the user changes cila's output, that edit is a preference signal — infer the rule behind it, store
it, and apply it next time. Over a few projects cila stops needing the same correction twice.

> **Scope (`docs/DECISIONS.md` `[scope]`): build-time only.** The *only* learning signal is the
> user's own edits + the cila-Bench score (`bench/`). **No** production analytics, no deployed-state,
> no conversion data — ever. This is the user teaching cila their taste, in dev.

Two stores, both under `${CLAUDE_PLUGIN_DATA}/cila/` (the plugin's persistent data dir; survives across
projects and sessions):
- `taste/*.md` — inferred natural-language preferences, keyed by context.
- `examples/*/` — curated, bench-gated exemplars for few-shot reuse.

## A. Diff → preference (CIPHER / PRELUDE)

### When it fires
- The user **edited** a file cila generated (UI component, page, copy, `tokens.css`, `DESIGN.md`,
  `CONTENT.md`) — detected by reading the diff (git or the session's edit history).
- Or the user says it in words: "remember…", "always…", "stop doing…", "I prefer…", "from now on…".

### Infer the rule (one line, natural language)
1. Read the **before → after** diff. Ask: *what general preference does this specific edit reveal?*
2. **Separate STYLE from CONTENT** — they route to different consumers:
   - **STYLE** = look/feel/structure: type, color, spacing, motion, layout, component choice, density.
     (→ read by `design-director` / the build.)
   - **CONTENT** = message/voice/copy: word choice, tone, claims, section order, CTA wording.
     (→ read by `content-strategist` / the `copywriting`+`voice` build pass.)
3. Generalize *carefully* — one edit ≠ a law. Phrase it as a portable rule, not a restatement of the
   diff. Note confidence. Examples:
   - STYLE: "Prefers tighter hero vertical rhythm — cut hero padding from `--space-32` toward `--space-20`."
   - STYLE: "Dislikes pill buttons; wants `--radius-sm` (sharp) on CTAs."
   - CONTENT: "Headlines should name the product's mechanism, not the benefit ('watches your tokens' not 'stay consistent')."
   - CONTENT: "Cut the 'trusted by' social-proof band — they find it hollow without real logos."
4. **Don't store noise.** A one-off typo fix, a content correction specific to *this* brand's facts, or
   a change you can't generalize → skip it. Store taste, not data.

### Store it
Append to a context-keyed file `${CLAUDE_PLUGIN_DATA}/cila/taste/<key>.md`, where `<key>` is the
**page type + (optional) brand/project** so retrieval is targeted: `saas-landing.md`,
`portfolio.md`, `acme.md`, plus a `global.md` for project-agnostic preferences. Each line:

```
- [style|content] (conf: high|med|low, 2026-05-27, proj:acme) <the one-line rule>  — from: <8-word diff gist>
```

Keep it append-only-ish; the refinement pass (D) prunes. Confirm in one plain sentence
("Got it — I'll keep CTAs sharp-cornered."); don't lecture.

## B. Retrieve into the build (k-nearest)

At **direction** and **build** time, before generating:
1. Determine the active context (page type from the brief + brand/project).
2. Pull the **k-nearest** taste files: exact page-type key + brand key + `global.md` (k≈3 files;
   within a file, prefer higher-confidence + more-recent + same-project lines). Don't dump the whole
   store — relevance beats volume.
3. Feed STYLE rules to `design-director`/build; CONTENT rules to `content-strategist`/copy pass.
4. Treat them as **strong priors, not handcuffs** — the brief and the user's explicit ask still win,
   and a locked `DESIGN.md`/`CONTENT.md` overrides a stale preference. If a preference conflicts with
   the current brief, surface it briefly rather than silently obeying.

## C. The curated example bank (MemSkill-style, bench-gated)

Every shipped page that **scores well on cila-Bench** becomes a retrievable few-shot exemplar — the
compounding asset. Best-of-N (`explore`) and `design-director` seed from the nearest exemplars.

### Gate (don't pollute the bank)
Only promote an output to the bank when **both**:
- it passed the production gates (the normal `/cila:go` Stage-4 PASS), **and**
- it earned a **high cila-Bench standing** — i.e. it won its pairwise matches / ranks at/above the
  current top `cila@vN` for that page type in `bench/results.json` (see `bench/`). Use the bench, not
  vibes, as the gate. Mediocre output in the bank teaches mediocrity.

### Store it
Under `${CLAUDE_PLUGIN_DATA}/cila/examples/<page-type>--<short-slug>/`:
- `DESIGN.md` + `CONTENT.md` (the contracts that produced it),
- `screenshot.png` (the decision-viewport shot; the visual exemplar),
- `why.md` — 3–5 lines: what makes this good, the signature move, the bench standing + date.

### Retrieve
At direction/build time, pull the **1–2 nearest** exemplars by page type (then brand/tone) and pass
them as *positive few-shot references* — "this is the bar; do something as good, not a copy." Never
plagiarize an exemplar's specific copy or art direction across brands; it's a quality reference, not a
template.

## D. Periodic refinement (PROSE-style — so taste doesn't drift)

Taste learned from edits drifts (contradictions accumulate, one-offs masquerade as rules). Periodically
(on demand, or every ~N additions) **replay and prune**:
- **Dedup & merge** near-duplicate rules into the crisper phrasing.
- **Resolve contradictions** — if two rules conflict, keep the newer / higher-confidence one and note
  the supersession (don't silently delete history).
- **Demote one-offs** — a rule that only ever applied to one project and was never reinforced gets
  dropped or scoped to that project's brand key.
- **Re-score against the holdout** — sanity-check that applying the profile doesn't *lower* agreement
  with the cila-Bench human holdout (a preference that games the user but tanks measured quality is a
  red flag). If the profile and the bench disagree, surface it.
- Keep each `taste/<key>.md` short (a tight ruleset beats a sprawling log). The bench + holdout are the
  external anchor that keeps self-learned taste honest.

## Notes
- **Storage:** everything lives in `${CLAUDE_PLUGIN_DATA}/cila/{taste,examples}/` — per-user, persistent,
  outside any project repo. Nothing is written into the user's site.
- **Loaded at SessionStart** (the wiring injects the relevant taste keys as context) and **read by
  `design-director` + `content-strategist`** at direction/build time.
- **Honest limit:** this learns the *user's* taste, which may diverge from measured quality — that's
  why C is bench-gated and D re-checks against the holdout. The user's taste wins on their own project;
  the bench keeps cila's *baseline* honest.
