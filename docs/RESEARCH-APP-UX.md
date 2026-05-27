# cila — App-UX Research Archive

Evidence base for the **app-UX layer** (application/interface design — dashboards, tools, product UIs), distinct from the marketing/landing brain. Four deep passes, 2026 + authoritative sources (NN/g, Laws of UX, Norman, Refactoring UI, W3C WAI-ARIA APG, web.dev). Build-time only.

**The one habit that separates app work from landing work:** *design the boring states first* (empty / loading / error / partial) and *bridge both gulfs on every screen* — make the next action obvious (execution) and the result of the last action unambiguous (evaluation).

---

## 1. Interaction-design principles & heuristics (the "why" + a review pass)

**Nielsen's 10 heuristics** → each with a concrete rule: visibility of system status (feedback <400ms, always show state) · match the real world (domain words, not DB jargon) · user control (Undo > confirm; exit everywhere) · consistency/standards (Jakob's Law) · error prevention (constraints, defaults, forgiving input) · recognition > recall (show, don't make them remember) · flexibility (accelerators: shortcuts, bulk, ⌘K) · aesthetic-minimalist (one primary action/screen; cut the rest) · error recovery (plain, inline, located, with a fix, input preserved) · help (in-context, searchable).

**Norman** — affordance vs **signifier** (clickable must *look* clickable), feedback, mapping, constraints, conceptual model = the user's mental model; bridge the **gulf of execution** (feedforward: what *will* happen) and **gulf of evaluation** (perceivable, interpretable result).

**Laws of UX** → the move each implies: Fitts (big/near/spaced targets) · Hick (fewer choices, recommend a default) · Jakob (work like apps they know) · Miller (chunk, don't dump) · **Tesler** (complexity lives in the system, not the user — smart defaults/inference) · **Doherty (<400ms** perceived — skeletons/optimistic UI) · Peak-End (engineer a delight peak + polish the ending) · Aesthetic-Usability (polish raises perceived usability — but still test function) · Postel (accept messy input, normalize silently). Plus Serial-Position (important nav at start/end), Von Restorff (one distinct primary action), Goal-Gradient/Zeigarnik (progress bars, checklists), Choice Overload (limit + default).

**Refactoring UI craft for apps:** hierarchy via **weight + color + spacing, not size**; ≤2 font weights; emphasize by de-emphasizing; drop label boilerplate; **no grey text on colored bg** (tint the hue); spacing/size scales (~25% steps); start with too much whitespace; **fewer borders** (use spacing/bg/shadow); a ~5-level elevation system; design in greyscale first; **design empty/loading/error first**.

**Cognitive load:** progressive disclosure (split by frequency, ≤2 levels, strong scent), chunking, defaults as the strongest lever, meaningful empty/first-run, just-in-time help over upfront tours.

→ cila runs the **heuristic-eval checklist** (status/feedback · action clarity · result clarity · cognitive load · error handling · control/consistency/craft) as a self-review pass on any app screen.

Sources: [NN/g 10 heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) · [slips vs mistakes](https://www.nngroup.com/articles/slips/) · [two UX gulfs](https://www.nngroup.com/articles/two-ux-gulfs-evaluation-execution/) · [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) · [Laws of UX](https://lawsofux.com/) · [Refactoring UI](https://refactoringui.com/) · [Design of Everyday Things](https://media.aanda.psu.edu/sites/media/aa/files/documents/norman_design-of-everyday-things.pdf)

---

## 2. App IA, navigation, app shell & dashboards (structure)

**Navigation kit** (pick a primary axis, layer secondary + utility — don't duplicate): **left sidebar** (default for tools, >5 sections, collapsible icon-rail for density — never icon-only) · **top bar** (≤5 sections) · **hybrid** (top context/workspace bar + sidebar) · secondary: **tabs** (peer views of one object), **local nav** (siblings), **breadcrumbs** (3+ levels only), **steppers** (linear flows) · **utility nav top-right** (search/notifications/account/workspace switcher) · **command palette ⌘K** (`cmdk`; accelerator over real nav, never the sole path) · **mobile**: bottom tab bar (3–5) + drawer overflow; desktop sidebar ⇄ mobile bottom bar.

**App shell** = persistent chrome (Header[utility] + Sidebar[primary] + Content + optional right rail/inspector); compose minimum slots. **Master-detail** (list+detail, 2-pane desktop → 1-pane mobile). Use shadcn `Sidebar` / Tailwind app-shell blocks, not custom layout. **Density:** 8px grid (tight 4/8/12 for dense), tables for dense data, max-width on reading/forms, squint-test.

**IA:** **object-oriented** (nouns: Projects, Contacts, Deals) is the default for B2B tools; routes mirror objects (`/[object]/[id]/[tab]`); shallow depth; multi-tenant path or subdomain; settings hub split personal/workspace/admin. Predictability > delight for enterprise.

**Onboarding:** skip when possible; **empty states *are* the onboarding** (status + teach + a real CTA); setup checklist w/ progress for multi-step activation; contextual help > forced tours.

**Dashboards:** #1 KPI **top-left** (F-pattern), **≤12 KPIs/view**, overview → drill-down; ban vanity widgets + dashboard sprawl; dashboards are for monitoring + triggering a drill-down, not deep analysis.

→ **Decision tree:** sections ≤4→top bar, ≥5→sidebar (collapsible if dense); two IA dims→hybrid; entity list→detail→master-detail (+right rail if persistent detail); depth 3+→breadcrumbs, peer views→tabs, linear→stepper; many features→⌘K; mobile→bottom bar+drawer.

Sources: [NN/g vertical nav](https://www.nngroup.com/articles/vertical-nav/) · [complex app design](https://www.nngroup.com/articles/complex-application-design/) · [utility nav](https://www.nngroup.com/articles/utility-navigation/) · [breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/) · [Pencil&Paper SaaS nav](https://www.pencilandpaper.io/articles/ux-pattern-analysis-navigation) · [shadcn app-shell blocks](https://ui.shadcn.com/docs/blocks) · [Mobbin command palette](https://mobbin.com/glossary/command-palette) · [dashboard principles](https://uxpilot.ai/blogs/dashboard-design-principles)

---

## 3. State matrix, forms & data display (the "real app" layer)

**The full state matrix — design per data view** (the "no dead-end states" gate): **ideal** (design last) · **empty** ×3 (first-use = status+teach+pathway CTA; no-results = clear + recover; cleared = acknowledge) · **loading** (skeleton for content-shaped/perceived ~20–30% faster · spinner for short bounded actions · determinate progress for >2–10s; **no loader-flash <300ms**) · **partial** (render what you have, isolate pending/failed) · **error** (recoverable = plain + retry + preserve input; fatal = full-view with a way out, no raw stack) · **success** (proportional confirmation) · **offline** (inform, keep last-known, reconnect). **Optimistic UI** (`useOptimistic`/TanStack `onMutate`): snapshot→rollback, idempotent, only where success is near-certain — never for payments.

**Forms:** single-column · **labels above** (no placeholder-as-label) · correct `type`+`inputmode`+`autocomplete` · **inline validation on blur** · errors human/specific/constructive, **adjacent to field**, input preserved, multiple cues (not color-only) · **don't disable the submit button** (validate on submit, focus first error) · verb-first labels · separate destructive actions, **Undo > confirm** (confirm only for rare irreversible; typed confirmation for high-stakes) · wizard only for 2–4 natural groups · explicit save (or clear autosave status) · full WCAG wiring (`label`/`aria-invalid`/`aria-describedby`/`role=alert`) — shadcn `Form`+react-hook-form does this, verify it.

**Data display:** **table** (compare/scan/sort/bulk) vs **cards** (rich/visual) vs **list** (small/simple). The 4 table tasks → rules: find (human-readable first column, discoverable filters) · compare (freeze header+key columns, zebra/hover) · view/edit (**side panel/inline, not modal**) · act (1–2 inline + `⋯` overflow, bulk via checkboxes + pinned action bar). Filters: faceted with **counts**, disable zero-result, **removable chips + Clear all**. **Pagination** (task/compare/bookmarkable) vs **infinite scroll** (discovery feeds only) vs **Load More** (common hybrid); keep crawlable URLs. **Virtualize** (TanStack Virtual) past ~hundreds of rows + server-side paging. Numbers right-aligned/tabular. Responsive: tables collapse to stacked cards on mobile.

**Feedback:** toasts (`role=status`/`aria-live=polite`, don't move focus, ≥5s, + Undo) · inline confirmation > toast for in-context · real-time (SSE push / WebSocket bidirectional; highlight new items, "reconnecting…" on drop).

Sources: [NN/g empty states](https://www.nngroup.com/articles/empty-state-interface-design/) · [skeletons vs spinners](https://www.nngroup.com/videos/skeleton-screens-vs-progress-bars-vs-spinners/) · [form usability](https://www.nngroup.com/articles/web-form-design/) · [form errors](https://www.nngroup.com/articles/errors-forms-design-guidelines/) · [disabled buttons](https://www.smashingmagazine.com/2021/08/frustrating-design-patterns-disabled-buttons/) · [data tables: 4 tasks](https://www.nngroup.com/articles/data-tables/) · [pagination vs infinite scroll](https://blog.logrocket.com/ux-design/pagination-vs-infinite-scroll-ux/) · [TanStack Virtual](https://tanstack.com/virtual/latest) · [optimistic UI useOptimistic](https://www.freecodecamp.org/news/how-to-use-the-optimistic-ui-pattern-with-the-useoptimistic-hook-in-react/)

---

## 4. Accessible component patterns, ecosystem & app-grade a11y/perf

**WAI-ARIA APG = the acceptance criteria per component** (role/state + keyboard contract): dialog (`aria-modal`, focus trap + restore, Esc) · menu/menubar (roving tabindex, arrows, type-ahead) · combobox (`role=combobox` on input, `aria-activedescendant`, virtual focus) · listbox · tabs (roving, Left/Right, auto vs manual activation) · accordion/disclosure (`aria-expanded`, normal tab order) · tooltip (`aria-describedby`, hover+focus, never focusable, WCAG 1.4.13) · command palette (dialog + combobox) · data grid (`role=grid` composite, arrows + Enter/F2 to edit) · slider · switch · date picker (dialog + grid) · toast (live regions). **Roving tabindex vs `aria-activedescendant`** — Tab *between* widgets, arrows *within*.

**Headless ecosystem:** default **shadcn-on-Radix** (matches cila's registry use, owned/editable source, a11y by default); escalate to **React Aria** for the deep widgets (combobox, date picker, data grid, complex selection); **Base UI** (MUI team) is the most-actively-maintained primitive layer and shadcn now ships Base UI variants. **Flag any hand-rolled focus-trap / roving-tabindex / combobox** as a smell.

**App-grade a11y beyond axe** (the interaction layer scanners miss): **route-change focus** (move focus to new view's `<h1>`, update title, announce) · modal focus trap + restore · async results via a **pre-existing live region** · keyboard operability for composites · accessible names on icon controls · **WCAG 2.2:** target size 24px (2.5.8), focus-not-obscured (2.4.11), dragging alternative (2.5.7) · reduced motion.

**Dashboards/data-viz:** never color-only; ship a **data-table fallback**; **Recharts** (default React) / **Tremor** (shadcn-matched SaaS dashboards) / visx (custom) / Chart.js (10k+ pts, canvas).

**Perf — INP is the app metric** (≤200ms p75): yield to main thread (`scheduler.yield()`), avoid layout thrash, `content-visibility`, virtualize, debounce, optimistic UI, code-split heavy widgets (charts/editors/⌘K/date pickers).

→ **App gate ideas:** pattern-conformance (role/ARIA for named components) · focus-trap on dialogs · live-region for async · keyboard-operable custom widgets (flag `onClick` on `div`) · target-size · reduced-motion · INP heuristics (un-debounced handlers, unvirtualized long lists) · primitive-preference (flag hand-rolled). Pair with axe in CI for the markup layer.

Sources: [WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) · [keyboard interface practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) · [WCAG 2.2 new](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) · [target size 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) · [headless libs 2026](https://www.greatfrontend.com/blog/top-headless-ui-libraries-for-react-in-2026) · [SPA focus mgmt](https://oneuptime.com/blog/post/2026-01-15-focus-management-react-spa/view) · [accessible charts](https://www.a11y-collective.com/blog/accessible-charts/) · [INP](https://web.dev/articles/inp) · [optimize long tasks](https://web.dev/articles/optimize-long-tasks)

---

## How it builds into cila (proposed — see ROADMAP/discussion)
- **Routing:** `/cila:go` Stage 0 already detects marketing-vs-app; that choice also picks the *brain*.
- **New subagent `ux-architect`** (parallel to `content-strategist`) → writes **`UX.md`** (app type · nav pattern + app-shell spec · object IA + route map · key-screens inventory **with each screen's state set** · flows · dashboard plan). `design-director` then does the *look* (app = Refactoring-UI density craft).
- **New skills:** `app-ux` (principles/heuristics + IA/nav/shell/dashboards + the heuristic-eval checklist), `ux-states` (state matrix + forms + data display + the no-dead-end gate), `a11y-patterns` (APG component contracts + headless-ecosystem guidance + app-a11y-beyond-axe). Reuse `design-tokens`/`motion`/`voice`/`icons`.
- **Gates:** add app checks — no-dead-end-states (review-enforced + ACCEPTANCE.md criteria), focus-trap, live-region-for-async, keyboard-operable-custom-widget, INP heuristics, pattern-conformance (extend the existing `overlay-a11y`/reduced-motion/target-size gates).
- **Starter:** turn the Next starter into a real **app shell** (sidebar + header + ⌘K + a data table + a form + all states), since Next is the app path (Astro stays marketing).
- **Contracts:** `UX.md` (app) ‖ `CONTENT.md` (marketing) ‖ `DESIGN.md` (shared look) ‖ `ACCEPTANCE.md` (shared + app-state criteria).
