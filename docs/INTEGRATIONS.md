# cila — Optional External Integrations

cila's default stack is **100% free and keyless**. The items below are **opt-in** extras that need an account, API key, paid plan, or external app. cila documents and uses them when present, but **never hard-wires them into the plugin's `.mcp.json`** — so nothing breaks for someone who hasn't set them up. Wire only what you need.

| Integration | What it adds | Cost | Wiring / fallback |
|---|---|---|---|
| **AI image-gen** — Nano Banana / Gemini, fal.ai, Replicate Flux (`skills/wow`) | Bespoke hero art, seamless textures, OG images | **Paid** API / usage-billed (key) | `claude mcp add` the provider's image MCP with the key. **Free fallback:** shaders/CSS/3D (`wow`) + Pexels |
| **Pexels API** (`skills/wow`) | Real stock photography | **Free** (key) | `PEXELS_API_KEY` |
| **Mobbin MCP** (`skills/inspiration`) | 600k+ real app screens for inspiration | **Paid** plan (Pro+) | `mobbin.com/mcp` (OAuth). **Free alts:** unofficial `pdcolandrea/mobbin-mcp`, or Steel-driven gallery screenshots (default) |
| **poly.pizza API** (`skills/wow`) | Low-poly 3D models | **Free** hobby / PAYG commercial (key) | API key. **CC0 alt:** Poly Haven (keyless) |
| **Figma Dev Mode MCP** + Code-to-Canvas | Use a Figma file as the design source / push UI back to canvas | **Paid** Figma seat + the desktop app running | `claude mcp add --transport sse figma-dev-mode-mcp-server http://127.0.0.1:3845/sse` |
| **Chrome DevTools MCP** | Interaction-driven CWV/INP traces beyond the Lighthouse-CI gate | **Free** (keyless) | `claude mcp add chrome-devtools -s user -- npx chrome-devtools-mcp@latest` (opt-in perf profiling; Lighthouse CI is the enforced gate) |
| **Browser MCP for inspiration** — self-hosted **Steel** or `@playwright/mcp` | Screenshot live award-tier galleries to anchor design (`skills/inspiration`) | **Free** (self-hosted Steel, or the Playwright MCP) | The agent **detects when it's missing and asks you to wire one** — cila ships **no private endpoints**. Without it, work from a provided reference. |
| **Component Pro tiers** — Aceternity Pro / Magic UI Pro | Prebuilt page *templates* | **Paid** ~$199 one-time each | Not required — the free components are what produce the look |
| **Chromatic** | Hosted visual-regression review UI | **Free tier** → paid by snapshot volume | Optional — cila ships no VRT gate; bring your own if you want hosted snapshot review |

**Recurring baseline (not an integration):** your **Claude plan quota**. The build/review loops consume tokens — the visual loop ~3× (vision/screenshots). This is the one real ongoing cost; everything in the default stack is otherwise free.

**Bundled & free** (in `.mcp.json`, no key): shadcn MCP, Playwright MCP. **Free, keyless, used directly:** Iconify API (icons), Poly Haven (3D/CC0), Fontsource/Fontshare (fonts).
