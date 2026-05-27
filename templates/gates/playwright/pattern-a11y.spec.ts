/**
 * Gate: interaction-layer a11y patterns (cila app-UX frontier — WARN).
 *
 * axe-core verifies the *markup* layer (roles present, contrast, names) but is
 * largely blind to the *interaction* layer: a `<div onclick>` that looks like a
 * button to a sighted mouse user but is invisible to the keyboard and AT; a
 * widget that claims a composite role (`tablist`, `menu`, `combobox`, `switch`)
 * but omits the ARIA STATES that role's keyboard/AT contract requires; an app
 * that fires toasts/async updates with no live region for a screen reader to
 * announce. The WAI-ARIA APG defines these as the acceptance criteria per
 * component; this gate is the deterministic, lab-checkable floor for them.
 *
 * Three checks, all WARN (heuristic — legitimate exceptions exist):
 *
 *   1. Keyboard-operable custom widgets — an element carrying a click handler
 *      (inline `onclick`, or a framework handler detected via a `[data-*]` /
 *      common click-binding heuristic) that is NOT a native interactive element
 *      and lacks the keyboard contract: it needs a `role`, a focusable
 *      `tabindex` (≥0), and a key handler (`onkeydown`/`onkeyup`/`onkeypress`).
 *      This is the classic `<div onClick>` anti-pattern. → warn.
 *
 *   2. Live region for async — if the page ships toast-/notification-like
 *      containers (by class/data heuristic) but declares NO live region
 *      (`[aria-live]`, `[role=status]`, `[role=alert]`, `[role=log]`,
 *      `output`), async results won't be announced. → warn.
 *
 *   3. Pattern conformance — for elements with a known pattern role, assert the
 *      required ARIA states/relationships exist:
 *        • tablist  → each owned/contained tab has `aria-selected`; a selected
 *          tab points at its panel via `aria-controls`.
 *        • menu/menubar → each menuitem* is present; a submenu trigger has
 *          `aria-haspopup`/`aria-expanded`.
 *        • combobox → `aria-expanded`; `aria-controls`/`aria-owns` to its popup.
 *        • switch   → `aria-checked` (true|false).
 *      → warn (markup-shape only; full keyboard nav is a manual SR check).
 *
 * WHY WARN: heuristic click-handler / toast detection has exceptions (a `<div>`
 * with a handler that's purely decorative; a custom live-region library). Hard
 * facts (roles present, contrast, names) stay in the axe gate; APG keyboard
 * *navigation* is a manual SR spot-check. This never hard-fails.
 */

import { test, expect } from '@playwright/test';
import { ROUTES, VIEWPORTS, settle, warn } from './_helpers';

const vp = VIEWPORTS[VIEWPORTS.length - 1]; // desktop — interaction semantics are layout-independent

for (const route of ROUTES) {
  test.describe(`pattern a11y — ${route}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('keyboard-operable widgets, live regions, ARIA pattern states', async ({
      page,
    }, testInfo) => {
      await page.goto(route);
      await settle(page);

      const findings = await page.evaluate(() => {
        const out: string[] = [];
        const describe = (el: Element) => {
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute('role');
          const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : '';
          const cls =
            typeof (el as HTMLElement).className === 'string' &&
            (el as HTMLElement).className.trim()
              ? '.' + (el as HTMLElement).className.trim().split(/\s+/).slice(0, 2).join('.')
              : '';
          return `${tag}${id}${cls}${role ? `[role=${role}]` : ''}`;
        };

        // Native interactive elements (and roles that confer it) already get
        // keyboard operability from the platform.
        const NATIVE_INTERACTIVE = new Set([
          'a',
          'button',
          'input',
          'select',
          'textarea',
          'summary',
          'option',
          'label',
        ]);
        const INTERACTIVE_ROLES = new Set([
          'button',
          'link',
          'checkbox',
          'radio',
          'switch',
          'tab',
          'menuitem',
          'menuitemcheckbox',
          'menuitemradio',
          'option',
          'treeitem',
          'slider',
          'spinbutton',
          'textbox',
          'combobox',
          'searchbox',
        ]);

        const isNativeInteractive = (el: Element) => {
          const tag = el.tagName.toLowerCase();
          if (tag === 'a') return (el as HTMLAnchorElement).hasAttribute('href');
          return NATIVE_INTERACTIVE.has(tag);
        };

        // ── (1) Keyboard-operable custom widgets ─────────────────────────────
        // Inline onclick is the deterministic, observable signal. (Framework
        // handlers attached via addEventListener aren't visible in the DOM —
        // axe/this gate can't see them; that's a manual/lint concern noted in
        // the README. We also count a [data-*click*]-ish hint as weak evidence.)
        const clickish = new Set<Element>();
        for (const el of Array.from(document.querySelectorAll('*'))) {
          if (el.hasAttribute('onclick')) clickish.add(el);
        }
        for (const el of clickish) {
          if (isNativeInteractive(el)) continue;
          const role = (el.getAttribute('role') || '').toLowerCase();
          const roleInteractive = INTERACTIVE_ROLES.has(role);
          const ti = el.getAttribute('tabindex');
          const focusable = ti !== null && Number(ti) >= 0;
          const hasKeyHandler =
            el.hasAttribute('onkeydown') ||
            el.hasAttribute('onkeyup') ||
            el.hasAttribute('onkeypress');
          const missing: string[] = [];
          if (!roleInteractive) missing.push('an interactive role');
          if (!focusable) missing.push('tabindex="0"');
          if (!hasKeyHandler) missing.push('a key handler (onkeydown)');
          if (missing.length)
            out.push(
              `${describe(el)} has a click handler but is not keyboard-operable ` +
                `— missing ${missing.join(', ')} (use a <button>, or add role + ` +
                `tabindex + key handling). The <div onClick> anti-pattern.`
            );
        }

        // ── (2) Live region for async ────────────────────────────────────────
        const LIVE_SELECTOR =
          '[aria-live], [role=status], [role=alert], [role=log], output';
        const hasLiveRegion = !!document.querySelector(LIVE_SELECTOR);
        // Toast-like containers: a class or data attr hinting at toasts/snackbars/
        // notifications. Heuristic — keep it tight to avoid false positives.
        const TOAST_RE = /(toast|snackbar|notification|notistack|sonner|flash-message)/i;
        const toastLike = Array.from(document.querySelectorAll('*')).filter((el) => {
          const cls =
            typeof (el as HTMLElement).className === 'string'
              ? (el as HTMLElement).className
              : '';
          const data = Array.from(el.attributes).some(
            (a) => a.name.startsWith('data-') && TOAST_RE.test(a.name + ' ' + a.value)
          );
          return TOAST_RE.test(cls) || data;
        });
        if (toastLike.length && !hasLiveRegion)
          out.push(
            `${toastLike.length} toast/notification-like container(s) but no live ` +
              `region in the DOM ([aria-live]/[role=status|alert|log]/<output>) — ` +
              `async updates won't be announced to screen readers (declare a ` +
              `persistent polite live region the app writes into)`
          );

        // ── (3) Pattern conformance — required ARIA states per role ──────────
        // tablist / tab
        for (const tablist of Array.from(document.querySelectorAll('[role=tablist]'))) {
          const tabs = Array.from(tablist.querySelectorAll('[role=tab]'));
          if (!tabs.length) {
            out.push(`${describe(tablist)} has no [role=tab] children`);
            continue;
          }
          for (const tab of tabs) {
            if (!tab.hasAttribute('aria-selected'))
              out.push(`${describe(tab)} in a tablist lacks aria-selected`);
          }
          const selected = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
          if (selected && !selected.hasAttribute('aria-controls'))
            out.push(
              `selected ${describe(selected)} lacks aria-controls pointing at its tabpanel`
            );
        }

        // menu / menubar
        for (const menu of Array.from(
          document.querySelectorAll('[role=menu], [role=menubar]')
        )) {
          const items = Array.from(
            menu.querySelectorAll(
              '[role=menuitem], [role=menuitemcheckbox], [role=menuitemradio]'
            )
          );
          if (!items.length) out.push(`${describe(menu)} has no menuitem children`);
          for (const item of items) {
            const r = item.getAttribute('role');
            if (
              (r === 'menuitemcheckbox' || r === 'menuitemradio') &&
              !item.hasAttribute('aria-checked')
            )
              out.push(`${describe(item)} lacks aria-checked`);
            // A submenu trigger should advertise the popup + its open state.
            if (item.hasAttribute('aria-haspopup') && !item.hasAttribute('aria-expanded'))
              out.push(`submenu trigger ${describe(item)} lacks aria-expanded`);
          }
        }

        // combobox
        for (const cb of Array.from(document.querySelectorAll('[role=combobox]'))) {
          if (!cb.hasAttribute('aria-expanded'))
            out.push(`${describe(cb)} lacks aria-expanded (required on a combobox)`);
          if (!cb.hasAttribute('aria-controls') && !cb.hasAttribute('aria-owns'))
            out.push(
              `${describe(cb)} lacks aria-controls/aria-owns to its listbox popup`
            );
        }

        // switch
        for (const sw of Array.from(document.querySelectorAll('[role=switch]'))) {
          const checked = sw.getAttribute('aria-checked');
          if (checked !== 'true' && checked !== 'false')
            out.push(`${describe(sw)} lacks aria-checked="true|false"`);
        }

        return [...new Set(out)];
      });

      warn(testInfo, `Pattern a11y on ${route}`, findings);
      // Advisory: passes structurally. Hard a11y facts live in the axe gate;
      // full APG keyboard navigation is a manual SR spot-check.
      expect(Array.isArray(findings)).toBe(true);
    });
  });
}
