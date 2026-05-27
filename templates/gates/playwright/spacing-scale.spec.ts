/**
 * Gate: spacing-grid + type-scale conformance (cila Tier-1).
 *
 * - Margin / padding / gap on every visible element must land on the 4px grid
 *   (value % GRID === 0), within a small hairline tolerance for borders and
 *   sub-pixel rounding. Catches "the agent picked 13px".
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
  HAIRLINE_TOLERANCE,
  buildTypeScale,
  collectVisibleStyles,
  settle,
} from './_helpers';

/** True if `v` is on the grid within tolerance (0 always passes). */
function onGrid(v: number): boolean {
  if (v === 0) return true;
  const rem = Math.abs(v) % GRID;
  return rem <= HAIRLINE_TOLERANCE || GRID - rem <= HAIRLINE_TOLERANCE;
}

/** Nearest type-scale member within tolerance. */
function onScale(px: number, scale: number[]): boolean {
  if (px === 0) return true;
  return scale.some((s) => Math.abs(s - px) <= HAIRLINE_TOLERANCE);
}

for (const route of ROUTES) {
  test.describe(`spacing & type scale — ${route}`, () => {
    test(`spacing is on the ${GRID}px grid @ ${route}`, async ({ page }) => {
      await page.goto(route);
      await settle(page);

      const styles = await collectVisibleStyles(page);
      const offenders: string[] = [];

      for (const el of styles) {
        const labelled: [string, number[]][] = [
          ['margin', el.margins],
          ['padding', el.paddings],
          ['gap', el.gap],
        ];
        for (const [prop, vals] of labelled) {
          for (const v of vals) {
            if (!onGrid(v)) offenders.push(`${el.selector} { ${prop}: ${v}px }`);
          }
        }
      }

      const unique = [...new Set(offenders)];
      expect(
        unique,
        `${unique.length} off-grid spacing value(s) (grid=${GRID}px, tol=${HAIRLINE_TOLERANCE}px)`
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
