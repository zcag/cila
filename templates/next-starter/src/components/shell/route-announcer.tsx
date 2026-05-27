// route-announcer.tsx — SPA route-change a11y. On every client navigation it
// (1) moves focus to the new view's <main> (which holds the route <h1>), so
// keyboard/SR users land at the top of the new content instead of staying on a
// now-unmounted control, and (2) announces the new page title into a polite
// live region. Without this, client-side route changes are silent + focus is
// orphaned — the classic SPA a11y gap that axe can't catch.
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function RouteAnnouncer() {
  const pathname = usePathname();
  const [message, setMessage] = React.useState("");
  const firstRender = React.useRef(true);

  React.useEffect(() => {
    // skip the initial mount (no navigation happened yet)
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // defer to the next frame so the new <main> is in the DOM
    const id = requestAnimationFrame(() => {
      const main = document.getElementById("main");
      if (main) {
        main.focus();
        const heading = main.querySelector("h1");
        setMessage(`${heading?.textContent ?? document.title} — page loaded`);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
      {message}
    </div>
  );
}
