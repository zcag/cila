/**
 * Shared helpers for cila production gates.
 *
 * Everything here is project-agnostic: token allow-sets are read at runtime
 * from the resolved CSS custom properties on `:root`, never hardcoded. BASE_URL
 * and the page list come from the environment so a single suite covers any
 * cila-enabled site.
 *
 * Why `evaluate` / `getComputedStyle` instead of Playwright's `toHaveCSS`:
 * `toHaveCSS` (and `getAttribute`/locator CSS reads) cannot resolve CSS custom
 * properties — it returns the raw `var(--x)` token or an empty string for
 * `--custom-prop` names. To build a token allow-set we must run in the page and
 * read *resolved* values via `getComputedStyle(document.documentElement)`.
 */

import type { Page } from '@playwright/test';

/** Viewport matrix every layout/a11y/visual gate runs across. */
export const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

/** Base URL of the dev/preview server under test. Astro default. */
export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4321';

/**
 * Routes to gate. Override with a comma-separated CILA_ROUTES env var, e.g.
 * `CILA_ROUTES="/,/about,/pricing"`. Defaults to the home page only.
 */
export const ROUTES = (process.env.CILA_ROUTES ?? '/')
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);

/** 4px spacing grid base. Override via CILA_GRID env. */
export const GRID = Number(process.env.CILA_GRID ?? 4);

/**
 * Sub-pixel / hairline tolerance (px). Borders, transforms and fractional
 * device-pixel rounding legitimately produce values just off the grid.
 */
export const HAIRLINE_TOLERANCE = 1.5;

// ---------------------------------------------------------------------------
// Color normalization
// ---------------------------------------------------------------------------

/**
 * Normalize any computed color string to a canonical `r,g,b` or `r,g,b,a`
 * form so values from different sources (token vs computed) compare equal.
 *
 * Computed styles in Chromium come back as `rgb(r, g, b)` / `rgba(r, g, b, a)`
 * (and `color(srgb ...)` / `oklch(...)` for wide-gamut tokens). We run the real
 * parse in the browser (see {@link buildColorAllowSet}) where the engine has
 * already resolved everything; this string-level pass only canonicalizes the
 * already-resolved output for set membership.
 */
export function canonicalizeColor(input: string): string {
  const v = input.trim().toLowerCase();
  if (!v || v === 'none') return '';
  // Fully transparent — treat as a single bucket regardless of channel noise.
  if (v === 'transparent' || v === 'rgba(0, 0, 0, 0)') return 'transparent';

  const nums = v.match(/-?\d*\.?\d+(?:e-?\d+)?%?/gi);
  if (!nums) return v; // keyword we can't parse (e.g. currentcolor) — keep raw

  // rgb/rgba
  if (v.startsWith('rgb')) {
    const [r, g, b, a] = nums.map((n) => Number(n));
    if (a === undefined || a === 1) return `${r},${g},${b}`;
    return `${r},${g},${b},${round(a, 3)}`;
  }
  return v;
}

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

// ---------------------------------------------------------------------------
// In-page evaluation (runs in the browser context)
// ---------------------------------------------------------------------------

/**
 * Build the color allow-set by reading every resolved custom property off
 * `:root` (`getComputedStyle(document.documentElement)`), then resolving each
 * to an actual color via a throwaway element so `oklch()`, `color(srgb ...)`,
 * `#hex` and `var()` chains all collapse to the engine's canonical `rgb[a]()`.
 *
 * Returns canonicalized color strings. Runs inside `page.evaluate`.
 */
export async function buildColorAllowSet(page: Page): Promise<string[]> {
  const raw = await page.evaluate(() => {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);

    const resolved = new Set<string>();
    const resolve = (value: string): string => {
      probe.style.color = '';
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };

    // Iterate declared custom properties on :root.
    for (let i = 0; i < cs.length; i++) {
      const name = cs[i];
      if (!name.startsWith('--')) continue;
      const val = cs.getPropertyValue(name).trim();
      if (!val) continue;
      // Only keep values that resolve to a real color.
      const out = resolve(val);
      if (out && out !== 'rgba(0, 0, 0, 0)') resolved.add(out);
      // Also resolve `var(--name)` so token aliases land in the set.
      const viaVar = resolve(`var(${name})`);
      if (viaVar && viaVar !== 'rgba(0, 0, 0, 0)') resolved.add(viaVar);
    }

    // Always-allowed structural colors: transparent, pure black/white text
    // fallbacks the engine emits for inherited/unset values.
    ['transparent', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)'].forEach((c) =>
      resolved.add(c)
    );

    probe.remove();
    return [...resolved];
  });

  const set = new Set<string>();
  for (const c of raw) set.add(canonicalizeColor(c));
  return [...set];
}

/**
 * Build the numeric type scale (font sizes in px) from `--text-*` / `--font-size-*`
 * custom properties on `:root`. Tailwind v4 `@theme` emits `--text-sm`, `--text-base`
 * etc.; DTCG/Style Dictionary output tends to emit `--font-size-*`. Falls back to a
 * conventional modular scale if none are declared.
 */
export async function buildTypeScale(page: Page): Promise<number[]> {
  const sizes = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const toPx = (value: string): number => {
      probe.style.fontSize = '';
      probe.style.fontSize = value;
      return parseFloat(getComputedStyle(probe).fontSize) || 0;
    };
    const out = new Set<number>();
    for (let i = 0; i < cs.length; i++) {
      const name = cs[i];
      if (!name.startsWith('--')) continue;
      if (!/(^--text-|^--font-size-)/.test(name)) continue;
      const px = toPx(cs.getPropertyValue(name).trim());
      if (px > 0) out.add(Math.round(px * 100) / 100);
    }
    probe.remove();
    return [...out];
  });

  if (sizes.length) return sizes.sort((a, b) => a - b);
  // Fallback modular scale (px) — only used when a repo ships no type tokens.
  return [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];
}

// ---------------------------------------------------------------------------
// Visible-element walking
// ---------------------------------------------------------------------------

/**
 * Collect computed style facts for every *visible* element, in the page.
 * We do the whole walk inside one `evaluate` for speed and to use the real
 * `getComputedStyle`. An element is "visible" if it has layout boxes and is
 * not `display:none` / `visibility:hidden` / `opacity:0` / zero-area.
 */
export interface ElementStyle {
  selector: string;
  color: string;
  backgroundColor: string;
  borderTopColor: string;
  borderRightColor: string;
  borderBottomColor: string;
  borderLeftColor: string;
  fontSize: number;
  margins: number[];
  paddings: number[];
  gap: number[];
  hasVisibleBorder: boolean;
}

export async function collectVisibleStyles(page: Page): Promise<ElementStyle[]> {
  return page.evaluate(() => {
    const describe = (el: Element): string => {
      const tag = el.tagName.toLowerCase();
      const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : '';
      const cls =
        typeof (el as HTMLElement).className === 'string' &&
        (el as HTMLElement).className.trim()
          ? '.' + (el as HTMLElement).className.trim().split(/\s+/).slice(0, 2).join('.')
          : '';
      return `${tag}${id}${cls}`;
    };

    const num = (v: string) => parseFloat(v) || 0;
    const out: any[] = [];

    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const rect = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (
        s.display === 'none' ||
        s.visibility === 'hidden' ||
        s.opacity === '0' ||
        rect.width === 0 ||
        rect.height === 0
      )
        continue;

      const borderW = [
        s.borderTopWidth,
        s.borderRightWidth,
        s.borderBottomWidth,
        s.borderLeftWidth,
      ].map(num);
      const hasVisibleBorder = borderW.some((w) => w > 0);

      out.push({
        selector: describe(el),
        color: s.color,
        backgroundColor: s.backgroundColor,
        borderTopColor: s.borderTopColor,
        borderRightColor: s.borderRightColor,
        borderBottomColor: s.borderBottomColor,
        borderLeftColor: s.borderLeftColor,
        fontSize: num(s.fontSize),
        margins: [s.marginTop, s.marginRight, s.marginBottom, s.marginLeft].map(num),
        paddings: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map(num),
        gap: [s.rowGap, s.columnGap].map(num),
        hasVisibleBorder,
      });
    }
    return out;
  });
}

/** Wait for the page to be visually settled (fonts + a render frame). */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    // @ts-ignore — document.fonts exists in browsers.
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  });
}
