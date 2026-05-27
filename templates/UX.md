<!--
  UX.md — the locked UX/structure contract for an APPLICATION (the app equivalent of CONTENT.md).
  Written/updated by the ux-architect (via /cila:go). cila re-reads it every session; it defines WHAT the
  app is and HOW users move through it, and it drives DESIGN.md (the look) + ACCEPTANCE.md (the gates).
  Replace every <…>. The "Key screens × states" section is the heart — no screen ships without its states.
-->

# UX Contract — <App>

## App
- **What it does:** <one plain sentence>
- **Type:** <SaaS tool · dashboard · admin · B2B product · internal tool>
- **Users & top tasks:** <who> → <their top 3–5 tasks>
- **Core objects (nouns):** <Projects · Invoices · Contacts …>
- **Tenancy / roles:** <single | multi-tenant (path/subdomain)> · <roles & what each sees>

## Information architecture
- **Style:** <object-oriented | task-oriented> · **Top-level sections (plain nouns):** <…>

## Navigation & app shell
- **Primary nav:** <sidebar (collapsible) | top bar | hybrid> — <one line why>
- **Shell slots:** header (utility: search/⌘K · notifications · user/workspace) · sidebar · content · <[right rail/inspector?]>
- **Secondary:** <tabs (peer views) · breadcrumbs (3+ levels) · local nav>
- **Command palette (⌘K):** <yes/no — accelerator over nav, not the only path>
- **Responsive:** <desktop sidebar ⇄ mobile bottom-bar/drawer; 2-pane ⇄ 1-pane>

## Route map
```
/                      → <home / dashboard>
/<object>              → list (master-detail)
/<object>/[id]/[tab]   → detail + sub-views
/settings/*            → settings hub
```

## Key screens × states  (the heart — "no dead-end states": every state has a forward action)
For each screen, mark the states that apply and note its forms / table / primary action:
- **<Screen>** — ideal · empty <first-use / no-results / cleared> · loading <skeleton | spinner | progress> · partial · error <recoverable | fatal> · success · offline. — <forms? table? the one primary action?>
- **<Screen>** — <…>

## Critical flows
1. <flow — step → step → step>  (e.g. create-first-<object>)
2. <…>

## Dashboard (if any)
- **KPIs (≤~5, actionable):** <…> · top-left = #1 (F-pattern) · drill-down to <…> · no vanity widgets / sprawl.

## Components & accessibility
- Build on **shadcn-on-Radix** (WAI-ARIA APG contracts); escalate to React Aria for combobox / date picker / data grid / complex selection. Every interactive component: keyboard-operable, focus-managed (trap+restore on modals, focus on route change), `aria-live` for async, target ≥24px, `prefers-reduced-motion`. (See `app-ux`.)
