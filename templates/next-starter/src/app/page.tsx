// page.tsx — a REAL sample landing for the app/dashboard starter. A server
// component that exercises the full token system; the ONE motion moment is a
// client island (<LivePanel/>), and the theme toggle is another tiny island.
// Everything uses semantic tokens (bg-bg, text-fg, bg-brand, …) — no raw hex,
// no Tailwind color literals. Re-hue the whole page from tokens.css.
//
// Design intent (deliberately NOT default-shadcn, NOT the Astro starter twin):
//   • App framing: this sells a product surface, so the hero pairs copy with a
//     live-feeling analytics panel (the wow island) instead of a type specimen.
//   • Asymmetric hero: oversized display headline on a 12-col grid weighted
//     left, with the panel offset down on the right.
//   • Type tension: Bricolage Grotesque display vs. Hanken Grotesk body.
//   • A mesh-ish brand glow built from layered radial-gradients (no image).
//   • One orchestrated motion beat lives inside <LivePanel/>; the rest of the
//     page is static + accessible. Reduced-motion is honored throughout.
import Link from "next/link";
import { LivePanel } from "@/components/live-panel";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    kicker: "01",
    title: "One hue, whole system",
    body: "Every accent, ring, shadow and gradient derives from a single OKLCH --brand-hue. Swap one number, re-skin the app — contrast stays intact.",
  },
  {
    kicker: "02",
    title: "Tailwind v4, CSS-first",
    body: "Tokens live in @theme — no tailwind.config.js. The stylesheet is the design contract, so generators and gates read the same source of truth.",
  },
  {
    kicker: "03",
    title: "Server-first, motion where it counts",
    body: "Server components by default; client islands only for the interactive bits. The one motion beat is reduced-motion guarded, transform-only.",
  },
];

export default function Page() {
  return (
    <>
      {/* skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-surface-raised focus-visible:px-4 focus-visible:py-2 focus-visible:text-fg focus-visible:shadow-md"
      >
        Skip to content
      </a>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <span className="inline-block size-3 rounded-full bg-brand" aria-hidden="true" />
          cila
        </Link>
        <nav className="flex items-center gap-6 text-sm text-fg-muted">
          <a href="#features" className="transition-colors hover:text-fg">
            Features
          </a>
          <a
            href="#"
            className="hidden rounded-full border border-border-strong px-4 py-1.5 font-medium text-fg transition-colors hover:border-brand hover:text-brand sm:inline-block"
          >
            Docs
          </a>
          <ThemeToggle />
        </nav>
      </header>

      <main id="main">
        {/* ── Hero (asymmetric 12-col) ──────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* layered brand glow — pure CSS radial-gradient mesh, no image */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 50% at 12% 0%, var(--color-brand-soft) 0%, transparent 60%), radial-gradient(50% 45% at 92% 18%, var(--color-accent-soft) 0%, transparent 55%)",
            }}
            aria-hidden="true"
          />

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-y-12 px-6 pb-24 pt-12 md:grid-cols-12 md:gap-x-8 md:px-10 md:pt-20">
            {/* headline column — intentionally wider + left-weighted */}
            <div className="md:col-span-6 lg:col-span-6">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-sm font-medium text-fg-muted">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                cila starter · Next.js + Tailwind v4
              </p>
              <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-fg sm:text-6xl lg:text-7xl">
                Ship a product surface that{" "}
                <span className="text-brand">holds up</span>.
              </h1>
              <p className="mt-6 max-w-prose text-lg text-fg-muted md:text-xl">
                A real, minimal-but-complete App Router starter wired to one OKLCH
                brand hue, a CSS-first token system, and self-hosted variable type.
                Edit{" "}
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
                  tokens.css
                </code>
                , re-skin everything.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#features"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-fg-on-brand shadow-md transition-[background-color,transform] hover:bg-brand-hover active:translate-y-px"
                >
                  See the system
                  <span
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full px-2 py-3 font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  Read the design contract
                </a>
              </div>
            </div>

            {/* the wow island — offset down on the right, overlaps the gutter */}
            <div className="md:col-span-6 md:mt-10 lg:-mr-4 lg:mt-16">
              <LivePanel />
            </div>
          </div>
        </section>

        {/* ── Features (offset, not a centered 3-box grid) ──────────────────── */}
        <section
          id="features"
          className="mx-auto max-w-6xl scroll-mt-12 px-6 py-20 md:px-10"
        >
          <div className="mb-14 max-w-2xl">
            <p className="mb-3 font-mono text-sm text-brand">{"// the rig"}</p>
            <h2 className="text-4xl font-semibold tracking-tight text-fg md:text-5xl">
              Tokens first. Everything else follows.
            </h2>
          </div>

          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {features.map((f) => (
              <li
                key={f.kicker}
                className="group flex flex-col gap-4 bg-surface-raised p-8 transition-colors hover:bg-surface"
              >
                <span className="font-mono text-sm text-fg-subtle transition-colors group-hover:text-brand">
                  {f.kicker}
                </span>
                <h3 className="font-display text-2xl font-semibold leading-tight text-fg">
                  {f.title}
                </h3>
                <p className="text-fg-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── CTA band ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
          <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-brand-strong px-8 py-14 text-center md:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(60% 120% at 50% 0%, var(--color-brand) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />
            <h2 className="relative text-3xl font-semibold tracking-tight text-fg-on-brand md:text-4xl">
              Point an agent at it.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-fg-on-brand/80">
              Run <code className="font-mono">/cila:go</code>, lock a DESIGN.md, and
              let the build loop ship from this contract.
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-fg-muted sm:flex-row sm:items-center md:px-10">
          <p className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-brand" aria-hidden="true" />
            Generated with cila · edit{" "}
            <code className="font-mono text-fg">DESIGN.md</code>
          </p>
          <p>© {new Date().getFullYear()} — replace this.</p>
        </div>
      </footer>
    </>
  );
}
