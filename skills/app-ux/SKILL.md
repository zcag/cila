---
name: app-ux
description: cila's app interaction-design brain — usability heuristics turned into concrete rules, IA + navigation + app-shell + dashboard structure, and a runnable heuristic-eval pass for any app screen. Use when building app/dashboard/admin/internal-tool/SaaS/interface UI (not marketing/landing pages — that's content-structure).
---

# App UX

The application-design layer (dashboards, tools, admin, product UIs), distinct from the marketing/landing brain (`content-structure`). The look is handled by `frontend-aesthetics` + `design-tokens` + `motion`; this is the *behaviour*. Pair with `ux-states` (the real-app states/forms/data) and `a11y-patterns` (accessible components).

**The one habit:** design the boring states first (empty/loading/error/partial — see `ux-states`) and bridge both gulfs on every screen — make the next action obvious (execution) and the result of the last action unambiguous (evaluation).

## Heuristics → concrete rules
**Nielsen's 10** as rules: status (feedback <400ms, always show state) · match real world (domain words, not DB jargon) · user control (Undo > confirm; an exit everywhere) · consistency (Jakob's Law) · error prevention (constraints, defaults, forgiving input) · recognition > recall (show, don't make them remember) · flexibility (accelerators: shortcuts, bulk, ⌘K) · aesthetic-minimalist (one primary action/screen, cut the rest) · error recovery (plain, inline, located, with a fix, input preserved) · help (in-context, searchable).

**Norman:** affordance vs **signifier** — clickable must *look* clickable; feedback, mapping, constraints; the conceptual model = the user's mental model. Bridge the **gulf of execution** (feedforward: show what *will* happen) and **gulf of evaluation** (make the result perceivable + interpretable).

**Laws of UX → the move:** Fitts (big/near/spaced targets) · Hick (fewer choices, recommend a default) · Jakob (work like apps they know) · Miller (chunk, don't dump) · Tesler (push complexity into the system — smart defaults/inference) · Doherty (<400ms perceived — skeletons/optimistic UI) · Peak-End (one delight peak + polish the ending) · Aesthetic-Usability (polish lifts perceived usability — still test function) · Postel (accept messy input, normalize silently) · Serial-Position (key nav at start/end) · Von Restorff (one distinct primary action) · Goal-Gradient/Zeigarnik (progress bars, checklists) · Choice Overload (limit + default).

## Refactoring-UI craft for apps
Hierarchy via **weight + color + spacing, not size** · ≤2 font weights · emphasize by de-emphasizing · drop label boilerplate · **no grey text on colored bg** (tint the hue) · spacing/size scales in ~25% steps · start with too much whitespace · **fewer borders** (use spacing/bg/shadow) · a ~5-level elevation system · **design in greyscale first** · design empty/loading/error first. **Density:** 8px grid (tight 4/8/12 when dense), tables for dense data, max-width on reading/forms, squint-test the result.

## Cognitive load
Progressive disclosure: split by frequency, ≤2 levels deep, keep a strong information scent. Chunk. **Defaults are the strongest lever.** Meaningful empty/first-run states. Just-in-time contextual help over upfront tours.

## IA + navigation + app shell
**IA — object-oriented** (nouns: Projects, Contacts, Deals) is the B2B-tool default; routes mirror objects `/[object]/[id]/[tab]`; shallow depth; multi-tenant via path or subdomain; settings hub split personal/workspace/admin. Predictability > delight for enterprise.

**Nav kit** — pick a primary axis, layer secondary + utility, never duplicate: **left sidebar** (default for tools, >5 sections, collapsible icon-rail for density — never icon-only) · **top bar** (≤5 sections) · **hybrid** (top workspace bar + sidebar) · **tabs** (peer views of one object) · **local nav** (siblings) · **breadcrumbs** (3+ levels only) · **steppers** (linear flows) · **utility nav top-right** (search/notifications/account/workspace switcher) · **command palette ⌘K** (`cmdk`; an accelerator, never the sole path) · **mobile**: bottom tab bar (3–5) + drawer overflow (desktop sidebar ⇄ mobile bottom bar).

**App shell** = persistent chrome: Header[utility] + Sidebar[primary] + Content + optional right rail/inspector. Compose the minimum slots. **Master-detail** (list + detail, 2-pane desktop → 1-pane mobile). Use shadcn `Sidebar` / Tailwind app-shell blocks, not custom layout.

**Onboarding:** skip when possible; **empty states *are* the onboarding** (status + teach + a real CTA); setup checklist w/ progress for multi-step activation; contextual help > forced tours.

**Dashboards:** #1 KPI **top-left** (F-pattern), **≤12 KPIs/view**, overview → drill-down. Ban vanity widgets + dashboard sprawl. A dashboard monitors and triggers a drill-down — it's not the place for deep analysis. Charts need an a11y fallback (see `a11y-patterns`).

## Nav / shell decision tree
- sections ≤4 → top bar · ≥5 → sidebar (collapsible if dense) · two IA dimensions → hybrid
- entity list → detail → **master-detail** (+ right rail if detail is persistent)
- depth 3+ → breadcrumbs · peer views of one object → tabs · linear flow → stepper
- many features → add ⌘K · mobile → bottom bar + drawer

## Heuristic-eval checklist (cila runs this on every app screen)
1. **Status/feedback** — is system state always visible; every action acknowledged <400ms?
2. **Action clarity** (execution gulf) — is the next/primary action obvious and singular?
3. **Result clarity** (evaluation gulf) — is the outcome of the last action unambiguous?
4. **Cognitive load** — chunked, progressively disclosed, good defaults, no dump?
5. **Error handling** — prevented where possible; recoverable, located, fixable, input preserved?
6. **Control + consistency** — Undo/exit everywhere; matches platform & in-app conventions?
7. **Craft** — hierarchy by weight/color/spacing, few borders, greyscale-sound, right density?
8. **States** — does every data view have its full state set (defer to `ux-states`)?
