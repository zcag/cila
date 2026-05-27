/**
 * Gate: spacing-grid + type-scale conformance (cila Tier-1).
 *
 * - **margin** on every visible element must land on the 4px grid
 *   (`CILA_GRID`), within a small hairline tolerance for borders and sub-pixel
 *   rounding — this holds the *outer* rhythm strict.
 * - **padding / gap** may land on a finer 2px sub-grid (`CILA_PADDING_GRID`):
 *   Tailwind v4 half-step utilities (`py-1.5`/`gap-1.5` = 6px, `px-2.5` = 10px,
 *   with `--spacing: 0.25rem`) are legitimate design tokens that sit on a 2px
 *   rhythm. Set `CILA_PADDING_GRID=4` to forbid half-steps. Either way, an
 *   off-rhythm value like 13px is still caught.
 * - font-size must be a member of the type scale read from `:root` tokens
 *   (`--text-*` / `--font-size-*`), not an arbitrary value.
 *
 * Allow-sets are derived from tokens at runtime (see _helpers), so the suite
 * tracks whatever DESIGN.md/tokens.css the repo ships — no hardcoding.
 */

import { test, expect } from '@playwright/test';
import {
  ROUTES,
  GRID,
  PADDING_GRID,
  HAIRLINE_TOLERANCE,
  buildTypeScale,
  collectVisibleStyles,
  settle,
} from './_helpers';

/** True if `v` is on the given grid within tolerance (0 always passes). */
function onGrid(v: number, grid: number): boolean {
  if (v === 0) return true;
  const rem = Math.abs(v) % grid;
  return rem <= HAIRLINE_TOLERANCE || grid - rem <= HAIRLINE_TOLERANCE;
}

/** Nearest type-scale member within tolerance. */
function onScale(px: number, scale: number[]): boolean {
  if (px === 0) return true;
  return scale.some((s) => Math.abs(s - px) <= HAIRLINE_TOLERANCE);
}

for (const route of ROUTES) {
  test.describe(`spacing & type scale — ${route}`, () => {
    test(`spacing is on grid (margin ${GRID}px / padding+gap ${PADDING_GRID}px) @ ${route}`, async ({
      page,
    }) => {
      await page.goto(route);
      await settle(page);

      const styles = await collectVisibleStyles(page);
      const offenders: string[] = [];

      for (const el of styles) {
        // Margins hold the outer rhythm strict (4px). Padding/gap may use the
        // finer sub-grid (2px) so Tailwind half-step utilities are allowed.
        const labelled: [string, number[], number][] = [
          ['margin', el.margins, GRID],
          ['padding', el.paddings, PADDING_GRID],
          ['gap', el.gap, PADDING_GRID],
        ];
        for (const [prop, vals, grid] of labelled) {
          for (const v of vals) {
            if (!onGrid(v, grid))
              offenders.push(`${el.selector} { ${prop}: ${v}px (grid ${grid}px) }`);
          }
        }
      }

      const unique = [...new Set(offenders)];
      expect(
        unique,
        `${unique.length} off-grid spacing value(s) (margin grid=${GRID}px, ` +
          `padding/gap grid=${PADDING_GRID}px, tol=${HAIRLINE_TOLERANCE}px)`
      ).toEqual([]);
    });

    test(`font-size is on the type scale @ ${route}`, async ({ page }) => {
      await page.goto(route);
      await settle(page);

      const scale = await buildTypeScale(page);
      expect(scale.length, 'no type scale resolved').toBeGreaterThan(0);

      const styles = await collectVisibleStyles(page);
      const offenders: string[] = [];

      for (const el of styles) {
        if (!onScale(el.fontSize, scale)) {
          offenders.push(`${el.selector} { font-size: ${el.fontSize}px }`);
        }
      }

      const unique = [...new Set(offenders)];
      expect(
        unique,
        `${unique.length} off-scale font-size(s). Scale (px): ${scale.join(', ')}`
      ).toEqual([]);
    });
  });
}
