---
name: a11y-patterns
description: cila's accessible app-component layer — WAI-ARIA APG contracts (role/state + keyboard) for dialog/menu/combobox/tabs/grid/date-picker/toast/etc., roving-tabindex vs aria-activedescendant, the headless-lib decision (shadcn-on-Radix default → React Aria for deep widgets), and app-a11y beyond axe. Use when building interactive components (modal/menu/combobox/tabs/table/date-picker/command-palette/slider/switch/tooltip).
---

# A11y Patterns

Accessible-by-contract app components. The APG pattern is the **acceptance criteria** per component. Companion to `app-ux` (behaviour) and `ux-states` (states/forms). Reach for native `<dialog>` / `popover` first (see `frontend-aesthetics`), then a primitive lib — hand-rolled is the last resort.

## WAI-ARIA APG contracts (role/state + keyboard)
- **Dialog** — `role=dialog` + `aria-modal`, labelled; **focus trap + restore**, Esc closes, focus moves in on open.
- **Menu / menubar** — roving tabindex, Up/Down (menubar adds Left/Right), Enter/Space activates, type-ahead, Esc closes + restores focus.
- **Combobox** — `role=combobox` on the input, `aria-expanded`/`aria-controls`, **`aria-activedescendant` (virtual focus** stays in the input), Up/Down/Enter/Esc.
- **Listbox** — `role=listbox` + `option`s, `aria-selected`, arrow nav, type-ahead, single/multi semantics.
- **Tabs** — roving tabindex, Left/Right (Home/End), **automatic vs manual activation** (manual when panel load is expensive); `aria-selected` + `aria-controls`.
- **Accordion / disclosure** — button with `aria-expanded` controlling the region; **normal Tab order** (not roving).
- **Tooltip** — `aria-describedby`, shows on **hover + focus**, never focusable itself, Esc dismisses (WCAG 1.4.13 hover/focus content).
- **Command palette** — composition of **dialog + combobox** (use `cmdk`).
- **Data grid** — `role=grid` composite widget; arrow-key cell nav, Enter/F2 to edit, Esc to cancel; one Tab stop into the grid.
- **Slider** — `role=slider`, `aria-valuemin/max/now/text`, Left/Right/Up/Down + Home/End/PageUp/Down.
- **Switch** — `role=switch` + `aria-checked`, Space/Enter toggles.
- **Date picker** — **dialog + grid** (the calendar is a grid; arrows move days, PageUp/Down months); a parseable text input alongside.
- **Toast / live region** — `role=status` (polite) or `role=alert` (assertive); **must already exist in the DOM** before the message arrives; don't move focus.

## Roving tabindex vs aria-activedescendant
**Tab moves *between* widgets; arrows move *within* one.** Inside a composite widget pick one model:
- **Roving tabindex** — one child has `tabindex=0`, the rest `-1`; arrows move the 0 and real DOM focus. Default for menus/tabs/toolbars/grids.
- **aria-activedescendant** — DOM focus stays on the container/input; `aria-activedescendant` points at the active child (virtual focus). Use for **combobox** and editable composites where focus must stay in the input.

## Headless ecosystem
- **Default: shadcn-on-Radix** — owned/editable source, a11y by default, matches cila's registry use.
- **Escalate to React Aria** for the deep widgets — **combobox, date picker, data grid, complex/multi selection** — where the APG contract is hard to get right.
- **Base UI** (MUI team) is the most actively maintained primitive layer; shadcn now ships Base UI variants — fine to adopt.
- **Smell — flag and replace any hand-rolled focus-trap, roving-tabindex, or combobox.** These are where hand-rolled code fails real users.

## App-a11y beyond axe (the interaction layer scanners miss)
- **Route-change focus** — on SPA navigation move focus to the new view's `<h1>`, update `document.title`, announce.
- **Modal focus trap + restore** to the trigger on close.
- **Async results** announced via a **pre-existing live region** (not one injected at fire time).
- **Keyboard operability** for every composite; **flag `onClick` on a `<div>`** (use a real button/role + key handlers).
- **Accessible names** on every icon-only control.
- **WCAG 2.2:** target size **24px** (2.5.8) · **focus not obscured** (2.4.11) · **dragging has a single-pointer alternative** (2.5.7).
- **Reduced motion** — honour `prefers-reduced-motion` (see `motion`).

## Per-component a11y checklist
1. Correct **role + states** per the APG contract above.
2. Full **keyboard contract** (Tab between, arrows within; Enter/Space/Esc/Home/End as specified).
3. **Focus model** chosen correctly (roving vs activedescendant) and focus trap/restore where modal.
4. **Accessible name** present (label or `aria-label`); state changes announced via a live region.
5. **Target size ≥24px**, focus visible + not obscured, reduced-motion honoured.
6. Built on a **primitive** (Radix/React Aria/Base UI) — not hand-rolled.

## Charts
Charts are **never color-only** — also encode with shape/label/pattern, and ship a **data-table fallback** for the same data. Recharts (default React) · Tremor (shadcn-matched SaaS) · visx (custom) · Chart.js (10k+ pts, canvas).
