/**
 * Gate: reduced-motion fallback (cila Tier-1 — HARD).
 *
 * "Wow" pages get a bigger *performance* budget (see lighthouserc.showcase.json),
 * but reduced-motion is NON-NEGOTIABLE and applies to showcase pages too. Under
 * `prefers-reduced-motion: reduce` a page MUST NOT keep churning a heavy animation
 * loop. Concretely, on each route × viewport we require ONE of:
 *
 *   (a) the page is effectively static — no continuous requestAnimationFrame
 *       loop driving a <canvas> (covers raw rAF canvas churn AND an R3F
 *       `frameloop` that is still rendering every frame instead of being set to
 *       `'never'` / `'demand'`); OR
 *   (b) a documented static fallback element `[data-reduced-fallback]` is present
 *       and visible (the author intentionally swapped the animated hero for a
 *       still image / poster / static gradient).
 *
 * Rationale (RESEARCH.md §2 motion, §8 compositor-only animation): honoring
 * `prefers-reduced-motion` is a hard accessibility requirement; a continuously
 * repainting WebGL/canvas hero is exactly the vestibular-trigger this media query
 * exists to suppress. This gate can't be charmed — it measures real rAF activity
 * in the page, it doesn't read a self-reported flag.
 *
 * HOW IT MEASURES rAF:
 *   We wrap `window.requestAnimationFrame` *before any app script runs*
 *   (`addInitScript`) and count invocations. We then let the page settle and
 *   sample the call count across a fixed real-time window. A driven render loop
 *   re-schedules rAF every frame (~60/s); a settled, static page schedules ~0.
 *   One-shot reveal animations (a few frames then stop) and the single rAF our
 *   own `settle()` helper fires are well under the threshold.
 *
 * Escape hatch: if a hero legitimately needs to keep a (tiny, compositor-only)
 * loop even under reduce, mark its static substitute with [data-reduced-fallback]
 * and the (b) branch passes regardless of rAF — the author has made the
 * reduced-motion experience explicit and reviewable.
 */

import { test, expect, type Page } from '@playwright/test';
import { ROUTES, VIEWPORTS, settle } from './_helpers';

/**
 * Real-time window (ms) over which we sample rAF activity after the page has
 * settled. At 60fps a continuous loop fires ~ window/16.7 callbacks.
 */
const SAMPLE_MS = 1000;

/**
 * Max rAF callbacks allowed within SAMPLE_MS for a page to count as "static".
 * A continuous 60fps loop fires ~60; a settled page fires ~0. We allow a small
 * budget for one-shot reveals / late layout work that schedule a handful of
 * frames and then stop. Well below a single second of a driven loop.
 */
const MAX_RAF_IN_WINDOW = 10;

/** Install the rAF counter before any page script executes. */
async function instrumentRaf(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __cilaRaf: number };
    w.__cilaRaf = 0;
    const orig = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      w.__cilaRaf++;
      return orig(cb);
    };
  });
}

async function rafCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __cilaRaf: number }).__cilaRaf);
}

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test.describe(`reduced-motion @ ${vp.name} (${vp.width}) — ${route}`, () => {
      test.use({
        viewport: { width: vp.width, height: vp.height },
        // The whole point of the gate: emulate a user who asked for less motion.
        reducedMotion: 'reduce',
      });

      test('heavy/animated content has a static fallback under reduce', async ({ page }) => {
        await instrumentRaf(page);
        await page.goto(route);
        await settle(page);

        // (b) Documented static fallback — author opted into an explicit
        // reduced-motion substitute. If it's present & visible, the page passes
        // regardless of any loop (e.g. an ambient compositor-only background).
        const fallback = page.locator('[data-reduced-fallback]');
        const fallbackVisible =
          (await fallback.count()) > 0 && (await fallback.first().isVisible());

        // (a) Measure real rAF activity across a fixed window. Reset the counter
        // first so we only count callbacks scheduled *after* settle().
        await page.evaluate(() => {
          (window as unknown as { __cilaRaf: number }).__cilaRaf = 0;
        });
        await page.waitForTimeout(SAMPLE_MS);
        const fired = await rafCount(page);

        // Is there a canvas that could be the thing churning? (Informational —
        // helps the failure message point at the likely culprit.)
        const canvasCount = await page.evaluate(
          () => document.querySelectorAll('canvas').length
        );

        const isStatic = fired <= MAX_RAF_IN_WINDOW;

        expect(
          fallbackVisible || isStatic,
          fallbackVisible
            ? ''
            : `Under prefers-reduced-motion:reduce, ${route} fired ${fired} ` +
                `requestAnimationFrame callback(s) in ${SAMPLE_MS}ms ` +
                `(budget ${MAX_RAF_IN_WINDOW}); ${canvasCount} <canvas> present. ` +
                `A continuous render loop (raw rAF canvas churn, or an R3F ` +
                `frameloop still running) must be stopped under reduce — set R3F ` +
                `frameloop="never"/"demand", pause the rAF loop, or render an ` +
                `explicit static substitute marked [data-reduced-fallback].`
        ).toBeTruthy();
      });
    });
  }
}
