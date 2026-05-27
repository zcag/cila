---
name: app-ux
description: cila's app-behaviour brain — IA/navigation/app-shell/dashboards, usability heuristics as rules, the per-view state matrix (empty/loading/error/partial), forms, data display (tables/lists/filters), and accessible interactive components (WAI-ARIA APG contracts). Use when building app/dashboard/admin/internal-tool/SaaS UI, forms, data tables, lists, or accessible components (modal/menu/combobox/tabs/grid/date-picker/command-palette). Not for marketing pages — that's content-structure.
---

# App UX

The application *behaviour* layer (dashboards, tools, admin, product UIs), distinct from the marketing brain (`content-structure`). Look is handled by `frontend-aesthetics` + `design-tokens` + `motion`.

**The one habit:** design the boring states first (empty/loading/error/partial) and bridge both gulfs on every screen — make the next action obvious (execution) and the result of the last action unambiguous (evaluation). No state without a forward action.

## Heuristics → concrete rules
- **Status** — feedback <400ms, always show state (skeletons/optimistic UI).
- **Match the real world** — domain words, not DB jargon. Accept messy input, normalize silently.
- **User control** — Undo > confirm (confirm only for rare irreversible; typed confirm for high-stakes); an exit everywhere.
- **Consistency** — work like the apps they already know (Jakob's Law).
- **Error prevention** — constraints, smart defaults, forgiving input; push complexity into the system.
- **Recognition > recall** — show, don't make them remember. Chunk; don't dump (Miller).
- **Flexibility** — accelerators (shortcuts, bulk, ⌘K) layered over the basic path.
- **Aesthetic-minimalist** — ONE primary/distinct action per screen; cut the rest. Fewer choices, recommend a default (Hick/Choice Overload).
- **Targets** — big, near, spaced (Fitts); ≥24px.
- **Polish** — one delight peak + a clean ending (Peak-End); progress bars/checklists for multi-step (Goal-Gradient). Polish lifts *perceived* usability — still test function.

## Craft (Refactoring-UI)
Hierarchy via **weight + color + spacing, not size** · ≤2 font weights · emphasize by de-emphasizing · **no grey text on colored bg** (tint the hue) · **fewer borders** (use spacing/bg/shadow) · ~5-level elevation · **design in greyscale first**. **Density:** 8px grid (4/8/12 when dense), max-width on reading/forms, squint-test the result. Progressive disclosure: split by frequency, ≤2 levels deep, keep information scent. **Defaults are the strongest lever.**

## IA + navigation + app shell
- **IA — object-oriented** (nouns: Projects, Contacts, Deals); routes mirror objects `/[object]/[id]/[tab]`; shallow depth; settings split personal/workspace/admin. Predictability > delight for enterprise.
- **Nav** — sections ≤4 → top bar · ≥5 → **left sidebar** (collapsible icon-rail if dense, never icon-only) · two IA dimensions → hybrid (top workspace bar + sidebar). Peer views of one object → **tabs** · depth 3+ → breadcrumbs · linear flow → **stepper**. Utility nav top-right (search/notifications/account/workspace switcher). Add **⌘K** (`cmdk`) once feature-rich — an accelerator, never the sole path.
- **App shell** = persistent chrome: Header[utility] + Sidebar[primary] + Content + optional inspector rail. **Master-detail** (list + detail, 2-pane → 1-pane mobile). **Mobile:** sidebar ⇄ bottom tab bar (3–5) + drawer overflow. Use shadcn `Sidebar` / app-shell blocks, not custom layout.
- **Dashboards** — #1 KPI top-left (F-pattern), **≤12 KPIs/view**, overview → drill-down; it monitors, it's not the place for deep analysis. Ban vanity widgets.
- **Onboarding** — empty states *are* the onboarding (status + teach + a real CTA); setup checklist w/ progress for multi-step activation; contextual help > forced tours.

## State matrix — design every data view through all of these
- **Empty ×3** — *first-use* = status + teach + pathway CTA · *no-results* = message + recover path (clear/broaden filters) · *cleared* = acknowledge.
- **Loading** — **skeleton** for content-shaped views · spinner for short bounded actions · determinate progress for >2s · **never flash a loader <300ms** (delay it).
- **Partial** — render what you have; isolate pending/failed pieces; don't block the whole view on one slow part.
- **Error** — *recoverable* = plain language + Retry + **preserve input**, located at the failure · *fatal* = full-view message with a way out, **never a raw stack trace**.
- **Success** — proportional confirmation (inline tick / toast / full state). **Offline** — keep last-known data, auto-reconnect with a "reconnecting…" cue.
- **Optimistic UI** (`useOptimistic` / TanStack `onMutate`): snapshot → apply → rollback on error; idempotent; only where success is near-certain (likes/toggles/reorder), **never payments/irreversible**.

## Forms
Single column · **labels above** (never placeholder-as-label) · correct `type`/`inputmode`/`autocomplete` · **inline validation on blur** (not per keystroke), errors specific + constructive + adjacent + multi-cue (not color-only) · **don't disable submit** — validate on submit, focus the first error · verb-first labels, separate destructive actions · explicit save or clear autosave status · wizard only for 2–4 natural groups. shadcn `Form` + react-hook-form wires `aria-invalid`/`aria-describedby`/`role=alert` — **verify it**.

## Data display
**Container:** table (compare/scan/sort/bulk) · cards (rich/visual) · list (small/simple).
- **Table tasks** — *find*: human-readable first column + discoverable filters · *compare*: freeze header + key columns, zebra/hover · *view/edit*: **side panel or inline, not a modal** · *act*: 1–2 inline actions + `⋯` overflow, bulk via checkboxes + pinned action bar.
- **Filters** faceted with **counts**, disable zero-result, **removable chips + Clear all**. **At scale:** pagination (task/bookmarkable) vs infinite scroll (discovery feeds only) vs Load More — keep crawlable URLs; **virtualize (TanStack Virtual) past ~hundreds of rows** + server paging. Numbers right-aligned + tabular figures; tables collapse to stacked cards on mobile.
- **Feedback** — toasts `role=status`/`aria-live=polite`, don't move focus, ≥5s, include Undo; inline confirmation > toast in-context. Real-time via SSE/WebSocket, highlight new items.
- **Charts** — never color-only (also shape/label/pattern) + ship a **data-table fallback**. Recharts (default) · Tremor (shadcn SaaS) · visx (custom) · Chart.js (10k+ pts).

## Accessible components — APG contract = the acceptance criteria
Reach for native `<dialog>`/`popover` first, then a primitive lib; hand-rolled is last resort.
- **Dialog** — `aria-modal`, labelled, focus trap + restore, Esc closes, focus in on open.
- **Menu** — roving tabindex, Up/Down (menubar +Left/Right), Enter/Space, type-ahead, Esc restores focus.
- **Combobox** — `role=combobox` on input, `aria-expanded`/`aria-controls`, **`aria-activedescendant`** (focus stays in input), Up/Down/Enter/Esc.
- **Tabs** — roving tabindex, Left/Right + Home/End, `aria-selected`/`aria-controls`; manual activation when panel load is expensive.
- **Accordion/disclosure** — button `aria-expanded` controls the region; **normal Tab order** (not roving).
- **Tooltip** — `aria-describedby`, shows on **hover + focus**, never focusable, Esc dismisses.
- **Data grid** — `role=grid`, arrow cell nav, Enter/F2 edit, Esc cancel, one Tab stop in.
- **Slider / Switch** — `role=slider` (`aria-valuemin/max/now/text`, arrows + Home/End) / `role=switch` + `aria-checked`.
- **Date picker** — dialog + grid (arrows = days, PageUp/Down = months) + a parseable text input.
- **Command palette** — dialog + combobox (`cmdk`).

**Focus model** — Tab *between* widgets, arrows *within*. Pick one: **roving tabindex** (default for menus/tabs/toolbars/grids — one child `tabindex=0`, real DOM focus moves) or **aria-activedescendant** (combobox/editable composites — DOM focus stays put). **Toast/live region must already exist in the DOM** before the message; don't move focus.

**Headless ecosystem** — default **shadcn-on-Radix** (owned source, matches the registry); escalate to **React Aria** for the hard widgets (combobox, date picker, data grid, multi-select); Base UI is fine to adopt. **Smell — flag and replace any hand-rolled focus-trap, roving-tabindex, or combobox.**

**App-a11y beyond axe** — on SPA route change move focus to the new `<h1>` + update `document.title` + announce · accessible name on every icon-only control · **flag `onClick` on a `<div>`** (use a real button + key handlers) · WCAG 2.2: target ≥24px (2.5.8), focus not obscured (2.4.11), dragging has a single-pointer alternative (2.5.7) · honour `prefers-reduced-motion` (see `motion`).

## Heuristic-eval pass (cila runs this on every app screen)
1. **Status** — state always visible; every action acknowledged <400ms?
2. **Action clarity** (execution) — next/primary action obvious and singular?
3. **Result clarity** (evaluation) — outcome of the last action unambiguous?
4. **States** — every data view has its full state set, each with a forward action (no dead ends)?
5. **Errors** — prevented where possible; recoverable, located, fixable, input preserved?
6. **Control + consistency** — Undo/exit everywhere; matches platform & in-app conventions?
7. **Craft** — hierarchy by weight/color/spacing, few borders, greyscale-sound, right density?
8. **A11y** — interactive components meet their APG contract (role/state + keyboard + focus model + accessible name)?
