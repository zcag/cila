/**
 * Gate: layout invariants across the viewport matrix (cila Tier-1).
 *
 * Parametrized over 360 / 768 / 1024 / 1440. For each viewport, on each route:
 *   1. No horizontal scroll        — documentElement.scrollWidth <= clientWidth.
 *   2. No element overflows inline  — no visible box extends past the viewport
 *                                     right edge (beyond a 1px rounding slack).
 *   3. Touch targets >= 24x24       — WCAG 2.2 SC 2.5.8 (Target Size, Minimum),
 *                                     with the spec's documented exceptions
 *                                     applied (see below).
 *   4. No unintended overlap        — bounding-rect intersection between
 *                                     non-related interactive elements.
 *
 * WCAG 2.5.8 EXCEPTIONS HONORED (so legit patterns don't false-positive):
 *   (a) Inline       — a target whose computed `display` is exactly `inline`
 *                      (NOT inline-block/inline-flex, which form their own box),
 *                      carries its own text, AND sits inside a flowing text block
 *                      (its parent holds real text around the link). This is the
 *                      spec's "Inline" exception: a link wrapped in a sentence is
 *                      exempt; a small standalone inline-block control is not.
 *   (b) Enlarges on focus — a control that is visually-hidden / collapsed at
 *                      rest but grows to >= 24x24 once focused (skip-links,
 *                      "visually-hidden-until-focus" affordances). We actually
 *                      focus it and re-measure; if focused size clears the
 *                      threshold, it's exempt (the spec's "User agent control"
 *                      spirit + the offered-alternative reasoning).
 *   (c) Sufficient spacing — the spec's "Spacing" exception: a sub-24px target
 *                      passes if a 24px-diameter circle centered on it does not
 *                      intersect the 24px circle of any *other* target. We
 *                      approximate this with axis-aligned spacing: the target's
 *                      box, expanded so its smaller dimension reaches 24px, must
 *                      not overlap any other target's equally-expanded box.
 *
 * A genuinely small *standalone* control (block/inline-block button, not inline
 * in text, not spaced apart, not focus-enlarging) still FAILS — that's the bug
 * 2.5.8 is meant to catch.
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

        // Pass 1 (in-page): collect every undersized target with the facts we
        // need to apply the spec's exceptions. We tag each candidate so Pass 2
        // can re-focus it back in the page (focus must run in the real browser,
        // not in this evaluate() snapshot).
        const candidates = await page.evaluate(
          ({ min }) => {
            const sel =
              'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], [role=checkbox], [role=switch], [role=tab], [role=menuitem]';
            const ATTR = 'data-cila-tt';

            // All visible, enabled targets — used both as the candidate pool and
            // as the "other targets" set for the spacing exception.
            const all: { el: Element; r: DOMRect }[] = [];
            for (const el of Array.from(document.querySelectorAll(sel))) {
              const s = getComputedStyle(el);
              if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
              if ((el as HTMLElement).hasAttribute('disabled')) continue;
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue; // not rendered
              all.push({ el, r });
            }

            // Exception (c) — Spacing. The spec draws a 24px-diameter circle on
            // the target's center; a small target is exempt if that circle does
            // not intersect any other target's circle. We approximate with the
            // box expanded so its *smaller* side reaches `min`, then check that
            // expanded box against every other target's expanded box. Two
            // min-sized circles intersect iff center distance < min; for boxes
            // this is the conservative AABB analogue.
            const pad = (r: DOMRect) => {
              const gx = Math.max(0, (min - r.width) / 2);
              const gy = Math.max(0, (min - r.height) / 2);
              return {
                left: r.left - gx,
                right: r.right + gx,
                top: r.top - gy,
                bottom: r.bottom + gy,
              };
            };
            const overlaps = (
              a: { left: number; right: number; top: number; bottom: number },
              b: { left: number; right: number; top: number; bottom: number }
            ) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

            // Exception (a) — Inline. The spec's exception is for a target *in a
            // sentence / block of text* — i.e. one that participates in inline
            // flow and wraps with the text. That means computed `display: inline`
            // EXACTLY: `inline-block` / `inline-flex` establish their own box and
            // do NOT line-wrap with text, so they are NOT exempt (a small
            // inline-block button is a standalone control). We further require
            // the target to carry its own text and to sit in a parent that holds
            // surrounding text (a real flowing block, not a bare icon link).
            const isInlineInText = (el: Element, s: CSSStyleDeclaration): boolean => {
              if (s.display !== 'inline') return false;
              const own = (el.textContent || '').trim();
              if (!own) return false; // icon-only inline link → not "in a sentence"
              const parent = el.parentElement;
              if (!parent) return false;
              const parentText = (parent.textContent || '').trim();
              // Surrounding text in the parent beyond this link's own text.
              return parentText.length > own.length;
            };

            const out: {
              id: number;
              tag: string;
              txt: string;
              w: number;
              h: number;
              inlineInText: boolean;
              spacedApart: boolean;
            }[] = [];

            let id = 0;
            for (const { el, r } of all) {
              if (r.width >= min && r.height >= min) continue; // already big enough
              const s = getComputedStyle(el);

              const inlineInText = isInlineInText(el, s);

              // Spacing: does this target's padded box clear every OTHER target?
              const myBox = pad(r);
              let collides = false;
              for (const o of all) {
                if (o.el === el) continue;
                if (el.contains(o.el) || o.el.contains(el)) continue;
                if (overlaps(myBox, pad(o.r))) {
                  collides = true;
                  break;
                }
              }
              const spacedApart = !collides;

              el.setAttribute(ATTR, String(id));
              const tag = el.tagName.toLowerCase();
              const txt = (el.textContent || '').trim().slice(0, 20);
              out.push({
                id,
                tag,
                txt,
                w: Math.round(r.width),
                h: Math.round(r.height),
                inlineInText,
                spacedApart,
              });
              id++;
            }
            return out;
          },
          { min: MIN_TARGET }
        );

        // Pass 2: for the candidates not already exempt by (a) inline-in-text or
        // (c) spacing, check exception (b) — does it enlarge to >= 24x24 once
        // focused? We focus it in the real browser and re-measure. Skip-links and
        // visually-hidden-until-focus controls pass here.
        const failures: string[] = [];
        for (const c of candidates) {
          if (c.inlineInText || c.spacedApart) continue;

          const loc = page.locator(`[data-cila-tt="${c.id}"]`);
          let focusedW = c.w;
          let focusedH = c.h;
          try {
            await loc.focus();
            const fr = await loc.evaluate((el) => {
              const r = el.getBoundingClientRect();
              return { w: Math.round(r.width), h: Math.round(r.height) };
            });
            focusedW = fr.w;
            focusedH = fr.h;
            // Drop focus so the next candidate measures from rest.
            await loc.evaluate((el) => (el as HTMLElement).blur());
          } catch {
            // Not focusable / detached — fall back to the rest-size measurement.
          }
          if (focusedW >= MIN_TARGET && focusedH >= MIN_TARGET) continue; // (b) exempt

          failures.push(`${c.tag}[${c.txt}] ${c.w}x${c.h}`);
        }

        // Clean up our marker attributes so we don't leak DOM state.
        await page.evaluate(() => {
          for (const el of Array.from(document.querySelectorAll('[data-cila-tt]')))
            el.removeAttribute('data-cila-tt');
        });

        const unique = [...new Set(failures)];
        expect(
          unique,
          `${unique.length} undersized standalone touch target(s) — not inline in ` +
            `text, not spaced >=24px apart, and not focus-enlarging (WCAG 2.5.8)`
        ).toEqual([]);
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
