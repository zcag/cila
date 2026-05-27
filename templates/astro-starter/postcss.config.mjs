// Tailwind v4 is wired CSS-first through its PostCSS plugin — NOT a
// tailwind.config.js, and NOT @tailwindcss/vite. All design tokens live in
// src/styles/tokens.css via the v4 `@theme` block (the single source of truth).
// PostCSS keeps Tailwind decoupled from Astro's bundled Vite version, so there
// is no Vite peer-range to pin or break on an Astro/Vite bump.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
