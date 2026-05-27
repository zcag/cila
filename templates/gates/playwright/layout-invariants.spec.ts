/**
 * Gate: layout invariants across the viewport matrix (cila Tier-1).
 *
 * Parametrized over 360 / 768 / 1024 / 1440. For each viewport, on each route:
 *   1. No horizontal scroll        — documentElement.scrollWidth <= clientWidth.
 *   2. No element overflows inline  — no visible box extends past the viewport
 *                                     right edge (beyond a 1px rounding slack).
 *   3. Touch targets >= 24x24       — WCAG 2.2 SC 2.5.8 (Target Size, Minimum).
 *   4. No unintended overlap        — bounding-rect intersection between
 *                                     non-related interactive elements.
 *
 * NOTE: `locator.isVisible()` reports an element visible even when fully
 * occluded by another element (it only checks the box, not occlusion). For
 * overlap/hit-testing we use bounding-rect math + `document.elementsFromPoint`
 * (the real hit-test stack) rather than trusting isVisible().
 */

import { test, expect } from '@playwright/test';
import { ROUTES, VIEWPORTS, settle } from './_helpers';

const MIN_TARGET = 24; // px, WCAG 2.5.8
const SLACK = 1; // px, device-pixel rounding

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test.describe(`layout @ ${vp.name} (${vp.width}) — ${route}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('no horizontal scroll', async ({ page }) => {
        await page.goto(route);
        await settle(page);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(
          scrollWidth,
          `horizontal scroll: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`
        ).toBeLessThanOrEqual(clientWidth + SLACK);
      });

      test('no element overflows the inline axis', async ({ page }) => {
        await page.goto(route);
        await settle(page);
        const overflowers = await page.evaluate((slack) => {
          const vw = document.documentElement.clientWidth;
          const out: string[] = [];
          for (const el of Array.from(document.querySelectorAll('body *'))) {
            const s = getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden') continue;
            // Elements may legitimately scroll their own content.
            if (s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflowX === 'hidden')
              continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.right > vw + slack || r.left < -slack) {
              const tag = el.tagName.toLowerCase();
              const cls =
                typeof (el as HTMLElement).className === 'string'
                  ? (el as HTMLElement).className.trim().split(/\s+/).slice(0, 2).join('.')
                  : '';
              out.push(`${tag}${cls ? '.' + cls : ''} right=${Math.round(r.right)} vw=${vw}`);
            }
          }
          return [...new Set(out)];
        }, SLACK);
        expect(overflowers, `${overflowers.length} element(s) overflow the inline axis`).toEqual(
          []
        );
      });

      test('touch targets are at least 24x24 (WCAG 2.5.8)', async ({ page }) => {
        await page.goto(route);
        await settle(page);
        const small = await page.evaluate((min) => {
          const sel =
            'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [role=menuitem]';
          const out: string[] = [];
          for (const el of Array.from(document.querySelectorAll(sel))) {
            const s = getComputedStyle(el);
            if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
            if ((el as HTMLElement).hasAttribute('disabled')) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue; // not rendered
            // SC 2.5.8 exception: inline targets inside a sentence are exempt.
            if (s.display === 'inline') continue;
            if (r.width < min || r.height < min) {
              const tag = el.tagName.toLowerCase();
              const txt = (el.textContent || '').trim().slice(0, 20);
              out.push(`${tag}[${txt}] ${Math.round(r.width)}x${Math.round(r.height)}`);
            }
          }
          return [...new Set(out)];
        }, MIN_TARGET);
        expect(small, `${small.length} undersized touch target(s)`).toEqual([]);
      });

      test('no unintended overlap of interactive elements', async ({ page }) => {
        await page.goto(route);
        await settle(page);
        const overlaps = await page.evaluate(() => {
          const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [role=button]';
          const els = Array.from(document.querySelectorAll(sel)).filter((el) => {
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return (
              s.display !== 'none' &&
              s.visibility !== 'hidden' &&
              s.opacity !== '0' &&
              r.width > 0 &&
              r.height > 0
            );
          });

          const intersects = (a: DOMRect, b: DOMRect) =>
            a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

          const desc = (el: Element) => {
            const tag = el.tagName.toLowerCase();
            const txt = (el.textContent || '').trim().slice(0, 16);
            return `${tag}[${txt}]`;
          };

          const out: string[] = [];
          for (let i = 0; i < els.length; i++) {
            for (let j = i + 1; j < els.length; j++) {
              const a = els[i];
              const b = els[j];
              // Skip ancestor/descendant pairs — nesting is expected.
              if (a.contains(b) || b.contains(a)) continue;
              const ra = a.getBoundingClientRect();
              const rb = b.getBoundingClientRect();
              if (!intersects(ra, rb)) continue;

              // Confirm with the real hit-test: does b's center actually sit
              // on top of a (or vice versa)? isVisible() can't tell us this.
              const cx = (Math.max(ra.left, rb.left) + Math.min(ra.right, rb.right)) / 2;
              const cy = (Math.max(ra.top, rb.top) + Math.min(ra.bottom, rb.bottom)) / 2;
              const stack = document.elementsFromPoint(cx, cy);
              const ia = stack.findIndex((e) => e === a || a.contains(e));
              const ib = stack.findIndex((e) => e === b || b.contains(e));
              if (ia === -1 || ib === -1) continue; // neither owns that point
              out.push(`${desc(a)} ∩ ${desc(b)}`);
            }
          }
          return [...new Set(out)];
        });
        expect(overlaps, `${overlaps.length} interactive element overlap(s)`).toEqual([]);
      });
    });
  }
}
