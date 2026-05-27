/**
 * Gate: native-overlay accessibility (cila frontier — WARN, best-effort).
 *
 * Modern, accessible overlays should lean on the platform: a real `<dialog>`
 * (which gives focus trapping, `Esc` to close, the top layer, and an inert
 * backdrop for free) or the Popover API (`[popover]`). A hand-rolled
 * `<div role="dialog">` can be fine — but only if it ALSO does the focus
 * management the platform would have done. This gate flags the cases that
 * usually aren't:
 *
 *   • An *open* overlay (a visible `[role=dialog|alertdialog|menu]`, or a
 *     non-native dialog with `aria-modal="true"`) that is NOT a native
 *     `<dialog open>` / `[popover]` and shows no sign of focus management:
 *       - no focusable element inside it currently holds focus, AND
 *       - it declares no `aria-modal` / no documented trap hook
 *         (`[data-focus-trap]`) — i.e. nothing indicates focus is contained.
 *     → warn: "div role=dialog without focus-trap".
 *   • An open modal with no accessible name (no `aria-label`, no
 *     `aria-labelledby` resolving to non-empty text) → warn (APG dialog
 *     pattern requires the dialog be named).
 *   • An open hand-rolled modal whose focus is NOT actually trapped: we drive
 *     real `Tab` presses (behavior, not just evidence) and warn if focus leaks
 *     out of the modal instead of cycling within it.
 *   • A `<dialog>` opened with `.show()` (non-modal) when `aria-modal`/modal
 *     semantics look intended → informational warn (use `showModal()`).
 *   • A menu (`[role=menu]`) open with no `[role=menuitem]` children, or whose
 *     trigger lacks `aria-expanded` → warn (keyboard/AT semantics incomplete).
 *
 * WHY WARN + BEST-EFFORT: we can only inspect overlays that are *open in the
 * rendered DOM* at gate time — we don't synthesize clicks to open every menu
 * (that's brittle and route-specific). So this is a floor: if an overlay is
 * already open (SSR'd open, or default-open), we check it; closed overlays are
 * out of scope here and covered by the axe a11y gate + manual SR spot-check.
 * Per cila's frontier-gate rule, detection is heuristic, so this never
 * hard-fails. A `<div role="dialog">` without a focus-trap = warn, by design.
 */

import { test, expect } from '@playwright/test';
import { ROUTES, VIEWPORTS, settle, warn } from './_helpers';

const vp = VIEWPORTS[VIEWPORTS.length - 1]; // desktop

for (const route of ROUTES) {
  test.describe(`native-overlay a11y — ${route}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('open dialogs/menus use platform primitives or proper role + focus mgmt', async ({
      page,
    }, testInfo) => {
      await page.goto(route);
      await settle(page);

      const findings = await page.evaluate(() => {
        const out: string[] = [];
        const isVisible = (el: Element) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return (
            s.display !== 'none' &&
            s.visibility !== 'hidden' &&
            s.opacity !== '0' &&
            r.width > 0 &&
            r.height > 0
          );
        };
        const describe = (el: Element) => {
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute('role');
          const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : '';
          return `${tag}${id}${role ? `[role=${role}]` : ''}`;
        };

        const FOCUSABLE =
          'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable=""], [contenteditable=true]';

        // ── Dialogs ──────────────────────────────────────────────────────────
        // Candidate open dialogs: any visible role=dialog/alertdialog, plus open
        // native <dialog>, plus open [popover].
        const dialogish = Array.from(
          document.querySelectorAll(
            'dialog, [role=dialog], [role=alertdialog], [popover]'
          )
        );
        for (const el of dialogish) {
          const tag = el.tagName.toLowerCase();
          const isNativeDialog = tag === 'dialog';
          const isPopover = el.hasAttribute('popover');

          // Determine "open": native <dialog open>, [popover] in the top layer
          // (matches :popover-open), or a role=dialog that's visible.
          let open = false;
          if (isNativeDialog) open = (el as HTMLDialogElement).open;
          else if (isPopover) {
            try {
              open = el.matches(':popover-open');
            } catch {
              open = isVisible(el);
            }
          } else open = isVisible(el);
          if (!open) continue;

          // Native primitives give focus trapping for free.
          if (isNativeDialog) {
            // .show() (non-modal) opens it but doesn't trap focus / make the rest
            // inert. If it presents as a modal (aria-modal or a backdrop role),
            // nudge toward showModal().
            const ariaModal = el.getAttribute('aria-modal');
            const looksModal = ariaModal === 'true';
            // matches('::backdrop') isn't queryable; approximate "modal" via the
            // top-layer check used by showModal.
            const isTopLayer = (() => {
              try {
                return el.matches(':modal');
              } catch {
                return false;
              }
            })();
            if (looksModal && !isTopLayer)
              out.push(
                `${describe(el)} is aria-modal but opened non-modally — use ` +
                  `dialog.showModal() so focus is trapped and the page is inert`
              );
            continue; // native <dialog> otherwise OK
          }
          if (isPopover) continue; // platform-managed

          // Hand-rolled role=dialog/alertdialog. Require evidence of focus mgmt.
          const ariaModal = el.getAttribute('aria-modal') === 'true';
          const declaresTrap = el.hasAttribute('data-focus-trap');
          const active = document.activeElement;
          const focusInside = !!active && el.contains(active) && active !== document.body;
          const hasFocusable = !!el.querySelector(FOCUSABLE);

          if (!ariaModal)
            out.push(
              `${describe(el)} open without aria-modal="true" — assistive tech ` +
                `may not treat it as a modal (or use a native <dialog>)`
            );
          if (!declaresTrap && !focusInside)
            out.push(
              `${describe(el)} open but focus is not inside it and no focus trap ` +
                `is declared — prefer <dialog>/showModal() or move focus in + trap it ` +
                `(mark a verified trap with [data-focus-trap])`
            );
          if (!hasFocusable)
            out.push(`${describe(el)} has no focusable child to receive initial focus`);

          // Accessible name: a modal must announce what it is. Check the APG
          // labelling paths — aria-label, aria-labelledby pointing at present
          // text, or a [popover]-style heading is out of scope; APG wants an
          // explicit name on the dialog node.
          const labelledBy = el.getAttribute('aria-labelledby');
          const labelledByOk =
            !!labelledBy &&
            labelledBy
              .split(/\s+/)
              .filter(Boolean)
              .some((id) => {
                const t = document.getElementById(id);
                return !!t && (t.textContent || '').trim().length > 0;
              });
          const hasLabel = (el.getAttribute('aria-label') || '').trim().length > 0;
          if (!hasLabel && !labelledByOk)
            out.push(
              `${describe(el)} open without an accessible name — add aria-label ` +
                `or aria-labelledby pointing at its title (APG dialog pattern)`
            );
        }

        // ── Menus ────────────────────────────────────────────────────────────
        for (const menu of Array.from(document.querySelectorAll('[role=menu]'))) {
          if (!isVisible(menu)) continue;
          if (!menu.querySelector('[role=menuitem], [role=menuitemcheckbox], [role=menuitemradio]'))
            out.push(`${describe(menu)} open with no role=menuitem children`);
          // Its controlling trigger should expose aria-expanded.
          const id = (menu as HTMLElement).id;
          if (id) {
            const trigger = document.querySelector(`[aria-controls="${id}"]`);
            if (trigger && !trigger.hasAttribute('aria-expanded'))
              out.push(
                `trigger for ${describe(menu)} (aria-controls) lacks aria-expanded`
              );
          }
        }

        return [...new Set(out)];
      });

      // ── Focus-trap behavior (best-effort, Playwright-driven) ────────────────
      // The in-page pass above checks *evidence* of focus management (aria-modal,
      // [data-focus-trap], focus currently inside). This pass checks the actual
      // BEHAVIOR: for each open modal that has ≥2 focusable children, tab through
      // (length+1) times and confirm focus never escapes the modal — i.e. Tab
      // wraps/cycles inside rather than leaking to the page behind. We need the
      // real keyboard here (Tab can't be synthesized inside page.evaluate), so it
      // lives in the test context. Tag candidates in-page first for stable refs.
      const trapCandidates = await page.evaluate(() => {
        const isVisible = (el: Element) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return (
            s.display !== 'none' &&
            s.visibility !== 'hidden' &&
            s.opacity !== '0' &&
            r.width > 0 &&
            r.height > 0
          );
        };
        const FOCUSABLE =
          'a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable=""], [contenteditable=true]';
        const cands: { key: string; label: string; count: number }[] = [];
        const modals = Array.from(
          document.querySelectorAll('[role=dialog], [role=alertdialog]')
        ).filter((el) => el.tagName.toLowerCase() !== 'dialog' && isVisible(el));
        modals.forEach((el, i) => {
          const focusables = Array.from(el.querySelectorAll(FOCUSABLE)).filter((f) =>
            isVisible(f)
          );
          if (focusables.length < 2) return; // nothing meaningful to cycle
          const key = `cila-trap-${i}`;
          el.setAttribute('data-cila-trap-check', key);
          const role = el.getAttribute('role') || 'dialog';
          const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : '';
          cands.push({
            key,
            label: `${el.tagName.toLowerCase()}${id}[role=${role}]`,
            count: focusables.length,
          });
        });
        return cands;
      });

      const trapFindings: string[] = [];
      for (const cand of trapCandidates) {
        const modal = page.locator(`[data-cila-trap-check="${cand.key}"]`);
        // Seed focus into the modal, then Tab through one full cycle + 1.
        await page.evaluate((key) => {
          const el = document.querySelector(`[data-cila-trap-check="${key}"]`);
          const first = el?.querySelector<HTMLElement>(
            'a[href], button:not([disabled]), input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable=""], [contenteditable=true]'
          );
          first?.focus();
        }, cand.key);

        let escaped = false;
        for (let i = 0; i < cand.count + 1; i++) {
          await page.keyboard.press('Tab');
          const inside = await modal.evaluate(
            (el) => el.contains(document.activeElement) && document.activeElement !== document.body
          );
          if (!inside) {
            escaped = true;
            break;
          }
        }
        if (escaped)
          trapFindings.push(
            `${cand.label} does not trap focus — Tab moved focus outside the open ` +
              `modal (focus should cycle within; prefer <dialog>/showModal() or a ` +
              `verified trap marked [data-focus-trap])`
          );
      }

      // Clean up the temporary markers so they never leak into other checks.
      await page.evaluate(() => {
        document
          .querySelectorAll('[data-cila-trap-check]')
          .forEach((el) => el.removeAttribute('data-cila-trap-check'));
      });

      warn(testInfo, `Overlay a11y on ${route}`, [...findings, ...trapFindings]);
      // Best-effort advisory: passes structurally. Hard a11y facts (roles,
      // contrast, names) are covered by the axe gate.
      expect(Array.isArray(findings)).toBe(true);
    });
  });
}
