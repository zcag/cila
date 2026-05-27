# Validation log & system-improvement backlog

Real-run observations from taking actual projects through cila, and the concrete
mechanism changes they imply. **This is the spec for the enforcement work** — every item
here is grounded in a run we watched, not speculation. Update it after each real run.

---

## The central finding: encoded expertise ≠ applied output

Across multiple real runs, cila *has* the knowledge (wow stack, "show the product",
"anchor on references", "be striking") and **does not apply it**. There is a strong
**safe/tasteful attractor**: the design-director defaults to calm editorial, small
abstract visuals, no product shown, no signature moment — *regardless of prose telling it
to be bold*. The model reads striking/wow/show-product/anchor-references as **guidance it
can satisfy tastefully and minimally, then sails past.**

**The meta-lesson: advisory prose does not bind. Only three things change behavior —**
1. a **mandatory process step** (an action it must take, with an auditable artifact),
2. a **deterministic gate** (machine-checkable, with a hard threshold → HOLD),
3. a **blocking reviewer axis** (qualitative judge that returns HOLD, not a note).

Every soft instruction that matters must be converted into one of these three.

---

## Run log

### Run 1 — mira.cagdas.io landing (built ~0.1.1, reviewed at 0.2.x)
- Output: tasteful, calm, warm-editorial, cream palette. **Timid.** No signature moment,
  no product shown, washed-out. → triggered the 0.2.2 "wow-by-default" prose changes.

### Run 2 — mira landing rebuild (0.2.x, live-watched)
- **~30 min → a finished 7,600px / 9-section site handed over at once.** The first-cut
  checkpoint (0.2.1) **did not fire** — it built everything, then showed it.
- Same safe warm-editorial lane as Run 1 (Newsreader + Geist on cream). Strong *copy*
  (the content leg works), confident 112px serif hero, good contrast this time.
- **Showed the product nowhere.** Zero product media on the entire page (no canvas /
  image / video / iframe). Only graphic: a 13px logo glyph. A section literally titled
  *"Don't take our word for it. Open one."* had nothing to open. For a *visual rendering
  product*, this is the cardinal sin — and exactly what 0.2.2's prose was meant to prevent.
- Did **not** anchor on references on its own.

### Run 2b — hero corrected by explicit prompt (live-watched)
- Forced via a manual prompt to anchor on references + build a product-demo hero.
- It anchored on references **only because told to** ("set the bar by references" prose
  was skipped autonomously).
- Even then the hero came back **weak**: a single ~575×209px **decorative SVG**, not
  animating, still **no real product output** anywhere on the page. Pushed again with a
  literal spec (large / dominates fold / real rendered document / framed mock / not an
  abstract SVG). → confirms it keeps choosing *small + abstract + safe* over *large + real
  + bold* unless the constraint removes the wiggle room.

---

## Observed failure modes → required fix

| # | Failure mode (observed) | Current state | Required mechanism |
|---|---|---|---|
| 1 | Direction self-selects the safest aesthetic (calm cream editorial), both runs | prose: "default to striking" | **De-bias selection** + mandatory reference anchoring (below). For a *visual* product, the product's own output IS the hero. |
| 2 | Doesn't anchor on bold references unless explicitly told | passive prose: "set the bar by references" | **Mandatory step:** design-director MUST pull 2–3 bold award-tier references via `inspiration` before committing; **write the anchors into `DESIGN.md`** (auditable). |
| 3 | "Show the product" ignored — zero product media | advisory (director + reviewer) | **Deterministic gate:** hero/marketing above-the-fold must contain a substantial product visual; absent → HOLD. |
| 4 | "Signature moment" never *designed in* | vague: "at least one moment" | **Contract it:** director names a *specific* centerpiece in `DESIGN.md` + copies it into `ACCEPTANCE.md` as a checkable line. Not "a moment" — *the* moment. |
| 5 | When forced, the centerpiece is small + abstract + tasteful (a 575px SVG) | — | **Gate teeth:** centerpiece must (a) **dominate the fold** (size threshold vs viewport) and (b) be **real media** (img/canvas/video/framed mock) — a decorative SVG does **not** count. |
| 6 | Impact/wow is advisory; flat/no-signature pages pass | advisory axis | **Flip to blocking:** Impact/wow axis returns **HOLD** for flat dynamic range / no signature. |
| 7 | Anti-marathon checkpoint doesn't fire autonomously (30-min monolith) | prose: "checkpoint, don't disappear" | **Hard stop:** first-cut checkpoint must be an enforced gate the model can't skip on an autonomous run. |

---

## Enforcement set (to build after mira wraps, then validate)

1. **Mandatory reference-anchor step** in `design-director` (pull 2–3 bold refs, record in `DESIGN.md`).
2. **Contracted signature moment** — named centerpiece in `DESIGN.md` + `ACCEPTANCE.md`.
3. **Centerpiece gate with teeth** — present + dominates the fold + real media (not decorative SVG) → else HOLD.
4. **Impact/wow axis → blocking** in `design-reviewer`.
5. **First-cut checkpoint → hard stop** in the orchestrator.
6. **De-bias direction selection** away from the safe-editorial lane; visual products → product output is the spectacle.

**Validation rule:** after building these, re-run mira (and the from-scratch test) and
confirm the *output* changes — never trust the prose again. A gate that doesn't move real
output is theater; cut it.
