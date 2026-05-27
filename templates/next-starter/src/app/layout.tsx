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
import { AppShell } from "@/components/shell/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Atlas — cila app shell",
    template: "%s · Atlas",
  },
  description:
    "A cila-generated application shell: sidebar + header + ⌘K palette + a data table and an accessible form. Edit DESIGN.md + src/styles/tokens.css.",
  openGraph: {
    type: "website",
    title: "Atlas — cila app shell",
    description:
      "A cila-generated application shell. Edit DESIGN.md + src/styles/tokens.css.",
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

// Speculation Rules: progressively prerender same-origin navigations on a
// `moderate` signal (pointerdown / brief hover), so a click lands on an already-
// rendered page. Pattern: a `where`-clause that targets in-site links via an
// href-prefix match and EXCLUDES anything tagged `[rel~="nofollow"]` or
// non-prerenderable routes. Tune `eagerness` (conservative ≤ moderate ≤ eager)
// to trade prefetch cost for instant-nav coverage. Pure progressive enhancement:
// the JSON is ignored by browsers without the Speculation Rules API. Same-origin
// only keeps it build-time-safe (no third-party prefetch). Injected as a static
// string so it ships in the initial <head> HTML with no hydration cost.
const speculationRules = JSON.stringify({
  prerender: [
    {
      where: {
        and: [
          { href_matches: "/*" },
          { not: { selector_matches: "[rel~=nofollow]" } },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{ __html: speculationRules }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
