// Tailwind v4 is wired CSS-first through its PostCSS plugin — NOT a
// tailwind.config.js. All design tokens live in src/styles/tokens.css via the
// v4 `@theme` block (the single source of truth). This is the only build wiring
// Tailwind needs in a Next.js project.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
