// layout.tsx — the App Router document shell. Loads tokens + globals (which
// self-host the two variable fonts via Fontsource), sets metadata /
// color-scheme / theme-color, and applies the stored color scheme before paint
// (no flash of wrong theme).
//
// Fonts: self-hosted via Fontsource. The @font-face + woff2 are pulled in by
// `@import "@fontsource-variable/..."` at the top of globals.css and bundled by
// Next's CSS pipeline (NO Google CDN). The family strings ("Bricolage Grotesque
// Variable" / "Hanken Grotesk Variable") are wired in src/styles/tokens.css →
// --font-display / --font-body. Fontsource ships font-display:swap, so there's
// no FOIT; see README for swapping faces or moving to next/font/local.
import type { Metadata, Viewport } from "next";
import "../styles/tokens.css"; // tokens FIRST (source of truth)
import "../styles/globals.css"; // then fonts + resets

export const metadata: Metadata = {
  title: {
    default: "cila — app starter",
    template: "%s · cila",
  },
  description:
    "A cila-generated app/dashboard. Edit DESIGN.md + src/styles/tokens.css.",
  openGraph: {
    type: "website",
    title: "cila — app starter",
    description:
      "A cila-generated app/dashboard. Edit DESIGN.md + src/styles/tokens.css.",
  },
};

export const viewport: Viewport = {
  // Light + dark theme colors (the address bar tints to match scheme).
  // Hexes are the rendered values of --color-bg (light / dark) from tokens.css;
  // re-derive them if you change --brand-hue meaningfully.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfdfb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1411" },
  ],
  // honor light + dark for native UI (form controls, scrollbars)
  colorScheme: "light dark",
};

// No-flash color scheme: honor a saved choice, else system. Runs pre-paint.
// Kept as a raw string so it injects synchronously in <head> before hydration.
const noFlashTheme = `(()=>{try{const s=localStorage.getItem("theme");const d=s==="dark"||(!s&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
