// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Tailwind v4 is wired through the Vite plugin (NOT @astrojs/tailwind, NOT a
// tailwind.config.js). All design tokens live CSS-first in src/styles/tokens.css
// via the v4 `@theme` block — that file is the single source of truth.
export default defineConfig({
  // Static marketing/landing output → deploys cleanly to Cloudflare Pages.
  output: "static",

  // TODO: replace with the real production origin before deploy.
  // Used for canonical URLs, sitemap, og:url, etc.
  site: "https://example.com",

  vite: {
    plugins: [tailwindcss()],
  },
});
