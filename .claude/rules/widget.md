---
paths:
  - "apps/widget/**/*"
  - "apps/web/app/api/widget/**/*"
  - "apps/web/components/widget-demo.tsx"
---

# Widget (apps/widget)

Vite + vanilla TypeScript, no framework deps, IIFE build (`vite.config.ts`, `fileName: () => "sdk.js"`). Target <20KB gzip.

## Architecture

- `src/index.ts` — `window.Freebase` command queue boot (drains `.q` array, then replaces the stub); dispatches `init`/`identify`/`open`/`getUnreadCount`. Creates the single launcher via `createLauncher()` and hands each surface's button to it.
- `src/launcher.ts` — single collapsed launcher button (`.fb-launcher`) that fans out a speed-dial menu (`.fb-dial`) containing the 3 surface buttons on click. Outside-click/Escape collapses. `setUnreadCount(n)` drives the badge on the collapsed launcher.
- `src/styles.ts` — CSS string injected via `<style>` tag, all `--fb-*` CSS vars, no Tailwind. Unified `.fb-window` class for all 3 surfaces (replaced old separate `.fb-panel`/`.fb-popup`/`.fb-overlay`). `@media (max-width: 480px)` → full-screen bottom sheet.
- `src/feedback.ts`, `src/changelog.ts`, `src/roadmap.ts` — each is a dial-item button + `.fb-window` content. No overlay anywhere.
- `src/api.ts` — fetch helpers, JWT header attachment via `X-Freebase-User`.

## Command queue pattern (must preserve — this is what lets init() work before the script loads)

```html
<script>
  window.Freebase = window.Freebase || function(...a) { (window.Freebase.q = window.Freebase.q || []).push(a); };
  window.Freebase('init', { org: 'acme' });
</script>
<script src="/cdn/v1/sdk.js" async></script>
```

## Build

```bash
pnpm --filter @freebase/widget build
cp apps/widget/dist/sdk.js apps/web/public/cdn/v1/sdk.js
gzip -c apps/web/public/cdn/v1/sdk.js | wc -c   # must be < 20480
```

## Gotchas

- No React, no Tiptap, no Tailwind in the widget bundle — pure vanilla TS.
- Widget CSS must use `--fb-accent` etc., matching org `accentColor` — never hardcode emerald.
- `localStorage` key for unread tracking: `freebase_cl_read_${orgSlug}` — array of read post IDs.
- **Outside-click detection must use `e.composedPath()`, never a live `.contains()` check.** The launcher's `innerHTML` icon swap on click detaches the click's own target node mid-bubble, so a live `.contains()` check misreads the click as "outside" and immediately re-closes the dial it just opened. All 4 widget surfaces (launcher, feedback, changelog, roadmap) rely on this.
- Closing a surface panel that was opened from the dial must also reset the dial's own open state (`setSurfaceOpen(false)` clears `dialOpen`) or the launcher stays visually fanned-out with nothing open.
- Demo widget (`apps/web/components/widget-demo.tsx`) is mounted in the **root layout**, not the marketing page — persists across every route including admin. Controlled by `NEXT_PUBLIC_WIDGET_DEMO_ORG` env var; unset = no widget (safe default).

## Backend routes

- `apps/web/app/api/widget/[org]/config/route.ts` — GET org name/accentColor/categories (public, no auth).
- `apps/web/app/api/widget/[org]/identify/route.ts` — POST verify JWT, rate limited 60/min.
- Both enforce the org's `allowedOrigins` allowlist via `apps/web/lib/cors.ts` — see the `api-routes.md` rule for the origin-check mechanism.
