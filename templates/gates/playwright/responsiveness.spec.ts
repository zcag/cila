/**
 * Gate: INP / responsiveness checklist (cila frontier — WARN).
 *
 * Real INP (Interaction to Next Paint) is a FIELD metric — it needs actual user
 * interactions and can only be measured authoritatively with RUM, which is
 * explicitly out of cila's scope ([scope]: build-time only, no production
 * telemetry). The *lab proxy* for INP is TBT (Total Blocking Time), which the
 * Lighthouse gate already asserts (`total-blocking-time` in lighthouserc.cjs,
 * and INP itself as a warn there). This spec complements that with the
 * deterministic, lab-checkable hygiene that correlates with good INP:
 *
 *   1. No `transition: all` / `animation: all` — animating `all` forces the
 *      engine to watch every property and risks animating layout/paint props
 *      off the compositor; name the properties (transform/opacity).
 *   2. Transitions/animations should be compositor-only — only `transform`,
 *      `opacity`, and `filter` are safe to animate without main-thread
 *      layout/paint work that lengthens interaction latency.
 *   3. `content-visibility: auto` on long pages — pages well past one viewport
 *      should skip rendering offscreen content to keep the main thread free
 *      for interactions (improves both first render and INP). Warn if a very
 *      long page never uses it.
 *   4. Yield long handlers — heuristic: flag inline `on*` handlers and very
 *      large inline `<script>` blocks (a hand for "split work / yield to main
 *      thread with scheduler.yield / setTimeout / isInputPending"). This is a
 *      nudge, not proof; real long-task detection lives in the TBT lab metric.
 *   5. App-UX INP heuristics:
 *      (a) un-debounced high-frequency inline handlers — `oninput`/`onscroll`/
 *          `onmousemove`/`onpointermove`/`onresize`/`onwheel`/`ontouchmove`/
 *          `ondrag` fire many times per interaction; running work inline (vs a
 *          debounced/throttled listener) inflates INP and causes jank.
 *      (b) unvirtualized long lists — a list/table/grid with > ~200 row-like
 *          children in the DOM (override via CILA_LONG_LIST). Virtualize +
 *          paginate/stream; content-visibility on the container/rows counts as
 *          a mitigation.
 *
 * WHY WARN: every item here is a heuristic that has legitimate exceptions
 * (a `transition: all` on a tiny element is harmless; a short page needs no
 * content-visibility). Hard-failing would be flaky. The authoritative perf
 * fails stay in the Lighthouse CWV gate (TBT/LCP/CLS/non-composited-animations).
 */

import { test, expect } from '@playwright/test';
import { ROUTES, VIEWPORTS, settle, warn } from './_helpers';

/** Properties safe to animate without main-thread layout/paint. */
const COMPOSITOR_SAFE = new Set(['transform', 'opacity', 'filter', 'backdrop-filter']);

/** A page taller than this many viewports is "long" → expects content-visibility. */
const LONG_PAGE_VIEWPORTS = 3;

/** Inline <script> larger than this (chars) earns a "split/yield work" nudge. */
const BIG_INLINE_SCRIPT = 15_000;

/**
 * A list/table/grid with more row-like children than this is "long" → expects
 * virtualization (or content-visibility as a mitigation). ~200 rows is where
 * unvirtualized layout/paint starts to bite interaction latency.
 */
const LONG_LIST_ROWS = Number(process.env.CILA_LONG_LIST ?? 200);

const vp = VIEWPORTS[VIEWPORTS.length - 1]; // desktop — responsiveness is JS/CSS-bound, not layout-bound

for (const route of ROUTES) {
  test.describe(`responsiveness / INP checklist — ${route}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('INP-friendly CSS + main-thread hygiene', async ({ page }, testInfo) => {
      await page.goto(route);
      await settle(page);

      const findings = await page.evaluate(
        ({ safeList, longPageVp, bigScript, longList }) => {
          const safe = new Set(safeList);
          const out: string[] = [];
          const describe = (el: Element) => {
            const tag = el.tagName.toLowerCase();
            const cls =
              typeof (el as HTMLElement).className === 'string'
                ? (el as HTMLElement).className.trim().split(/\s+/).slice(0, 2).join('.')
                : '';
            return `${tag}${cls ? '.' + cls : ''}`;
          };

          // (1)+(2): scan computed transition properties. Only an *active*
          // transition matters — every element reports `transition-property: all`
          // by default with a 0s duration, which animates nothing. We pair each
          // property with its per-property duration and ignore zero-duration ones.
          const secs = (v: string) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v) || 0);
          const allProp = new Set<string>();
          const nonCompositor = new Set<string>();
          for (const el of Array.from(document.querySelectorAll('body *'))) {
            const s = getComputedStyle(el);
            // transition-property / -duration are parallel comma lists; duration
            // repeats cyclically if shorter than the property list.
            const props = s.transitionProperty.split(',').map((p) => p.trim().toLowerCase());
            const durs = s.transitionDuration.split(',').map((d) => secs(d.trim()));
            props.forEach((p, i) => {
              if (!p || p === 'none') return;
              const dur = durs.length ? durs[i % durs.length] : 0;
              if (dur <= 0) return; // declared but inert — not animating
              if (p === 'all') {
                allProp.add(describe(el));
                return;
              }
              if (p.startsWith('--')) return; // custom prop — engine-specific
              if (!safe.has(p)) nonCompositor.add(`${describe(el)} → transition: ${p}`);
            });
          }
          for (const d of allProp) out.push(`transition: all (animates every property) — ${d}`);
          for (const d of nonCompositor) out.push(`non-compositor transition — ${d}`);

          // (3): long page should use content-visibility:auto somewhere.
          const docH = document.documentElement.scrollHeight;
          const vh = window.innerHeight;
          if (docH > longPageVp * vh) {
            let usesCV = false;
            for (const el of Array.from(document.querySelectorAll('body *'))) {
              const cv = getComputedStyle(el).contentVisibility;
              if (cv === 'auto' || cv === 'hidden') {
                usesCV = true;
                break;
              }
            }
            if (!usesCV)
              out.push(
                `long page (${Math.round(docH / vh)}× viewport) uses no ` +
                  `content-visibility:auto — offscreen render work can lengthen INP`
              );
          }

          // (4): main-thread-work nudges — inline handlers + big inline scripts.
          let inlineHandlers = 0;
          for (const el of Array.from(document.querySelectorAll('*'))) {
            for (const a of Array.from(el.attributes)) {
              if (/^on[a-z]+$/i.test(a.name)) inlineHandlers++;
            }
          }
          if (inlineHandlers > 0)
            out.push(
              `${inlineHandlers} inline on* handler(s) — prefer addEventListener so ` +
                `long work can yield (scheduler.yield / isInputPending)`
            );

          for (const s of Array.from(document.querySelectorAll('script:not([src])'))) {
            const len = (s.textContent || '').length;
            if (len > bigScript)
              out.push(
                `large inline <script> (${len} chars) — split long synchronous ` +
                  `work and yield to the main thread to protect INP`
              );
          }

          // (5a): un-debounced high-frequency inline handlers. `oninput`,
          // `onscroll`, `onmousemove`, `onpointermove`, `onresize`, `onwheel`,
          // `ontouchmove` fire many times per interaction; running work inline
          // (vs a debounced/throttled addEventListener) is a classic INP/jank
          // smell. We can only see *inline* handlers in the DOM; their mere
          // presence on a high-frequency event is the warn (we can't measure the
          // work, so this is a nudge — matches the inline-handler stance above).
          const HIGH_FREQ = /^on(input|scroll|mousemove|pointermove|resize|wheel|touchmove|drag)$/i;
          const hot: string[] = [];
          for (const el of Array.from(document.querySelectorAll('*'))) {
            for (const a of Array.from(el.attributes)) {
              if (HIGH_FREQ.test(a.name)) hot.push(`${describe(el)} ${a.name}`);
            }
          }
          for (const h of [...new Set(hot)])
            out.push(
              `high-frequency inline handler (${h}) — these fire rapidly; debounce/` +
                `throttle the work (or use addEventListener + scheduler.yield) so it ` +
                `doesn't block paint and inflate INP`
            );

          // (5b): unvirtualized long lists. A list/table/grid with a very large
          // number of *row-like* DOM children is expensive to lay out, paint and
          // keep interactive. Past ~200 rows, virtualize (TanStack Virtual) +
          // server-side paging. Heuristic: count direct row children, and treat a
          // container declaring content-visibility on its children as mitigated.
          const ROW_OK = longList; // threshold passed in below
          const rowContainers: { node: Element; rows: number }[] = [];
          for (const list of Array.from(
            document.querySelectorAll('ul, ol, tbody, [role=listbox], [role=grid], [role=tree], [role=list]')
          )) {
            const tag = list.tagName.toLowerCase();
            const rowSel =
              tag === 'tbody'
                ? 'tr'
                : list.getAttribute('role') === 'grid'
                  ? '[role=row]'
                  : '[role=option], [role=treeitem], [role=listitem], li';
            const rows = list.querySelectorAll(rowSel).length;
            if (rows > ROW_OK) rowContainers.push({ node: list, rows });
          }
          for (const { node, rows } of rowContainers) {
            // Mitigated if the container or a row uses content-visibility (a poor
            // man's virtualization for paint), which we treat as intentional.
            const cvOnSelf = getComputedStyle(node).contentVisibility;
            const firstRow = node.firstElementChild;
            const cvOnRow = firstRow ? getComputedStyle(firstRow).contentVisibility : 'visible';
            if (cvOnSelf === 'auto' || cvOnSelf === 'hidden' || cvOnRow === 'auto') continue;
            out.push(
              `unvirtualized long list ${describe(node)} (${rows} rows in the DOM) — ` +
                `virtualize (e.g. TanStack Virtual) + paginate/stream so the main ` +
                `thread isn't laying out hundreds of rows (hurts INP & memory)`
            );
          }

          return [...new Set(out)];
        },
        {
          safeList: [...COMPOSITOR_SAFE],
          longPageVp: LONG_PAGE_VIEWPORTS,
          bigScript: BIG_INLINE_SCRIPT,
          longList: LONG_LIST_ROWS,
        }
      );

      warn(testInfo, `INP/responsiveness on ${route}`, findings);
      // Advisory gate: passes structurally; the hard INP/TBT budget is enforced
      // by the Lighthouse CWV gate (lighthouserc.cjs).
      expect(Array.isArray(findings)).toBe(true);
    });
  });
}
