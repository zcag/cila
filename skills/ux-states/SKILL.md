---
name: ux-states
description: cila's real-app layer — the full per-view state matrix (empty/loading/partial/error/success/offline), optimistic UI, form design, data display (tables/cards/lists, filters, pagination, virtualization), and the no-dead-end-states gate. Use when building data views, tables, forms, lists, or handling loading/empty/error/success states.
---

# UX States

The "real app" layer under `app-ux`. Most app bugs are unhandled states. Design these *first*, in greyscale. Components here must satisfy `a11y-patterns`.

## The state matrix — design every data view through all of these
The **no-dead-end gate**: each state below must offer a forward action. Design the **ideal** state *last*.

- **Empty ×3** — *first-use* = status + teach + a pathway CTA (this is your onboarding) · *no-results* = clear message + a recover path (clear/broaden filters) · *cleared* = acknowledge the action.
- **Loading** — **skeleton** for content-shaped views (perceived ~20–30% faster) · **spinner** for short bounded actions · **determinate progress** for >2–10s waits · **never flash a loader for <300ms** (delay showing it).
- **Partial** — render what you have; isolate the pending/failed pieces; don't block the whole view on one slow part.
- **Error** — *recoverable* = plain language + Retry + **preserve input**, located at the failure · *fatal* = full-view message with a way out, **never a raw stack trace**.
- **Success** — confirmation proportional to the action (inline tick for small, toast for transient, full state for major).
- **Offline** — inform, keep last-known data, auto-reconnect with a "reconnecting…" cue.

## Optimistic UI
`useOptimistic` / TanStack `onMutate`: **snapshot → apply → rollback on error**. Keep mutations idempotent. Only where success is near-certain (likes, toggles, reorder) — **never for payments or irreversible writes**. Always surface the eventual real result.

## Forms
- **Single column** · **labels above** (never placeholder-as-label) · correct `type` + `inputmode` + `autocomplete`.
- **Inline validation on blur** (not on every keystroke); errors human/specific/**constructive**, **adjacent to the field**, input preserved, multiple cues (not color-only).
- **Don't disable the submit button** — validate on submit, then focus the first error.
- Verb-first action labels · separate destructive actions · **Undo > confirm** (confirm only for rare irreversible actions; typed confirmation for high-stakes).
- Wizard only for 2–4 natural groups · **explicit save**, or a clear autosave status.
- Full WCAG wiring: `<label>` / `aria-invalid` / `aria-describedby` / `role=alert` — shadcn `Form` + react-hook-form does this; **verify it** (see `a11y-patterns`).

## Data display
**Pick the container:** **table** (compare/scan/sort/bulk) · **cards** (rich/visual) · **list** (small/simple).

**The 4 table tasks → rules:**
- *Find* — human-readable first column; discoverable filters.
- *Compare* — freeze header + key columns; zebra/hover.
- *View/edit* — **side panel or inline, not a modal**.
- *Act* — 1–2 inline actions + `⋯` overflow; bulk via checkboxes + a pinned action bar.

**Filters:** faceted with **counts**; disable zero-result options; **removable chips + Clear all**.
**Lists at scale:** **Pagination** (task/compare/bookmarkable) vs **infinite scroll** (discovery feeds only) vs **Load More** (common hybrid) — keep crawlable URLs. **Virtualize** with **TanStack Virtual** past ~hundreds of rows, plus server-side paging.
**Formatting:** numbers right-aligned + tabular figures. **Responsive:** tables collapse to stacked cards on mobile.

## Feedback
**Toasts** — `role=status` / `aria-live=polite`, **don't move focus**, ≥5s, include Undo. **Inline confirmation > toast** when in-context. **Real-time** — SSE (push) / WebSocket (bidirectional); highlight new items; show "reconnecting…" on drop.

## No-dead-end-states procedure (per view)
1. List every state from the matrix that this view can enter.
2. For each, write the message + **the forward action** (CTA, retry, clear-filters, undo, exit).
3. Confirm loading respects the <300ms no-flash rule and partial-data isolation.
4. Confirm errors preserve input and are located at the failure.
5. Any state with no forward action is a **dead end → fix before shipping** (mirror these into ACCEPTANCE.md).
