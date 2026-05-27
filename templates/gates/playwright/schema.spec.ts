/**
 * Gate: JSON-LD structured-data presence (cila frontier — WARN).
 *
 * Content / marketing pages should emit at least one valid JSON-LD block so the
 * page is legible to search engines and AI answer surfaces. This gate parses
 * every `<script type="application/ld+json">`, requires each to be well-formed
 * JSON, and requires at least one to carry an `@type` (the minimum signal that
 * it's real structured data, not an empty stub).
 *
 * WHY WARN, NOT HARD-FAIL:
 *   - Not every route is a content/marketing page — an app dashboard, a /login,
 *     or a utility route legitimately ships no schema. Hard-failing those would
 *     be wrong and flaky. Set CILA_SCHEMA_ROUTES to scope the *expectation*.
 *   - JSON-LD richness (correct vocab, required props per @type) is a judgement
 *     call best left to a human / Rich Results test, not a deterministic gate.
 * So: malformed JSON or an @type-less block is always flagged; *absence* on an
 * expected content route warns. The test never hard-fails (frontier gate).
 *
 * Scope which routes are *expected* to carry schema via CILA_SCHEMA_ROUTES
 * (comma-separated, subset of CILA_ROUTES). Default: every gated route — the
 * common case for a marketing build where every page is content. For an app
 * build, point it at just the marketing/content routes (or set it empty to only
 * validate blocks that *do* exist, never warning on absence).
 */

import { test, expect } from '@playwright/test';
import { ROUTES, VIEWPORTS, settle, warn } from './_helpers';

/** Routes where a JSON-LD block is *expected*; absence there warns. */
const EXPECTED = (process.env.CILA_SCHEMA_ROUTES ?? ROUTES.join(','))
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);

// Structured data is document-level, not viewport-dependent — one viewport is
// enough. Use the first of the matrix for a deterministic context.
const vp = VIEWPORTS[VIEWPORTS.length - 1]; // desktop

for (const route of ROUTES) {
  test.describe(`schema (JSON-LD) — ${route}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('emits at least one valid JSON-LD block', async ({ page }, testInfo) => {
      await page.goto(route);
      await settle(page);

      const blocks = await page.evaluate(() =>
        Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
          (s) => s.textContent ?? ''
        )
      );

      const warnings: string[] = [];
      let validWithType = 0;

      blocks.forEach((raw, i) => {
        const text = raw.trim();
        if (!text) {
          warnings.push(`block #${i + 1}: empty <script type="application/ld+json">`);
          return;
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          warnings.push(`block #${i + 1}: not well-formed JSON (${(e as Error).message})`);
          return;
        }
        // A JSON-LD payload may be a single node, a graph array, or an @graph.
        const nodes: unknown[] = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === 'object' && '@graph' in (parsed as object)
            ? ((parsed as { '@graph': unknown[] })['@graph'] ?? [])
            : [parsed];
        const hasType = nodes.some(
          (n) => n && typeof n === 'object' && '@type' in (n as object)
        );
        if (hasType) validWithType++;
        else warnings.push(`block #${i + 1}: parses but no @type on any node`);
      });

      // Absence on a route we *expect* to be content → warn.
      if (validWithType === 0 && EXPECTED.includes(route)) {
        warnings.push(
          blocks.length === 0
            ? 'no <script type="application/ld+json"> on a content/marketing route'
            : 'JSON-LD present but no block carries a valid @type'
        );
      }

      warn(testInfo, `JSON-LD on ${route}`, warnings);
      // Frontier gate: advisory only. Assert that we ran (route reachable), so a
      // navigation/parse crash still surfaces as a real failure.
      expect(Array.isArray(blocks)).toBe(true);
    });
  });
}
