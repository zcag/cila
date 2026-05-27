/**
 * Gate: visual regression (cila Tier-2, perceptual).
 *
 * Per route × viewport, capture a deterministic full-page screenshot and diff
 * it against the committed baseline. This is a *perceptual* gate — it sits
 * below the structural Tier-1 gates and never overrides them. Baselines are
 * the accept/reject memory from the critique loop (approved screenshots become
 * regression anchors).
 *
 * Determinism levers:
 *   - animations: 'disabled'  — freeze CSS animations/transitions, fast-forward
 *     to their end state so motion doesn't flake the diff.
 *   - mask                     — null out genuinely dynamic regions (clocks,
 *     carousels, video, randomized hero art) via [data-visual-dynamic].
 *   - maxDiffPixelRatio        — tolerate sub-pixel AA noise without hiding
 *     real regressions.
 *
 * Generate/update baselines with:  npm run gate:visual -- --update-snapshots
 *
 * Baselines are platform-specific (font rendering differs across OSes). Commit
 * the ones produced by your CI runner, or generate inside the CI container.
 */

import { test, expect } from '@playwright/test';
import { ROUTES, VIEWPORTS, settle } from './_helpers';

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test.describe(`visual @ ${vp.name} (${vp.width}) — ${route}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('matches baseline screenshot', async ({ page }) => {
        await page.goto(route);
        await settle(page);

        // Elements opted out of the diff via [data-visual-dynamic].
        const masks = await page.$$('[data-visual-dynamic]');

        const slug = route === '/' ? 'home' : route.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '');
        await expect(page).toHaveScreenshot(`${slug}-${vp.name}.png`, {
          fullPage: true,
          animations: 'disabled',
          caret: 'hide',
          mask: masks,
          maxDiffPixelRatio: 0.01,
          // Small absolute floor so a handful of AA pixels never fails a tiny page.
          maxDiffPixels: 100,
        });
      });
    });
  }
}
