import type { NextConfig } from "next";

// Minimal by design. Tailwind v4 is handled in postcss.config.mjs; tokens live
// CSS-first in src/styles/tokens.css. Add deploy/runtime config here as needed
// (images, redirects, etc.) — kept empty so the contract stays in the CSS.
const nextConfig: NextConfig = {};

export default nextConfig;
