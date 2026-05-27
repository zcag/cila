// @ts-check
import { defineConfig } from "astro/config";

// Tailwind v4 is wired CSS-first through its PostCSS plugin (see
// postcss.config.mjs) — NOT @astrojs/tailwind, NOT @tailwindcss/vite, NOT a
// tailwind.config.js. All design tokens live CSS-first in src/styles/tokens.css
// via the v4 `@theme` block — that file is the single source of truth.
//
// Why PostCSS instead of the Vite plugin: @tailwindcss/vite carries a strict
// Vite peer range, which couples it to whatever Vite version Astro bundles and
// breaks the moment Astro bumps Vite (e.g. to a rolldown build). The PostCSS
// plugin has no Vite dependency, so there is nothing to pin and nothing to
// break on an Astro/Vite upgrade.
export default defineConfig({
  // Static marketing/landing output → deploys cleanly to Cloudflare Pages.
  output: "static",

  // TODO: replace with the real production origin before deploy.
  // Used for canonical URLs, sitemap, og:url, etc.
  site: "https://example.com",
});
