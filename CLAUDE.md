# Freebase — Build Context

This file is the primary context for building Freebase. Read it at the start of every session. Update it after every phase completes.

## Phase Status

- [x] Phase 1 — Monorepo scaffold, Prisma schema, auth, admin shell, marketing page
- [x] Phase 2 — Feedback board (public + admin + voting + comments)
- [x] Phase 3 — Changelog (Tiptap editor, public page, RSS, email subscriptions)
- [x] Phase 4 — Roadmap (kanban, admin promote/drag, public view)
- [x] Phase 5 — Embeddable widget (Vite bundle, 3 surfaces, JWT identify)
- [ ] Phase 6 — API keys, webhooks, settings, Docker Compose, README

---

## Stack (locked — do not change without explicit approval)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| DB | Neon (Postgres) — pooled + unpooled |
| Auth | Supabase Auth only (NOT Supabase DB) |
| ORM | Prisma |
| Styling | Tailwind CSS v4 + custom shadcn/ui components |
| Rich text | Tiptap (admin only, text-only v1) |
| Email | Resend (env-gated via EMAIL_FROM_DOMAIN) |
| Widget | Vite + Vanilla TypeScript, <20KB gzip |
| Rate limit | Upstash Redis + @upstash/ratelimit (Edge middleware) |
| Monorepo | pnpm workspaces + Turborepo |
| Animations | motion |
| Icons | Lucide React |
| Theme | next-themes |
| Validation | Zod |
| Command palette | cmdk (Phase 6) |

---

## Routing (path-based — works on vercel.app with no DNS config)

```
/                              → marketing landing page
/new                           → create org (public)
/login                         → admin login (public)
/[org]/feedback                → public feedback board
/[org]/changelog               → public changelog list
/[org]/changelog/[slug]        → single changelog post
/[org]/roadmap                 → public roadmap
/[org]/admin                   → redirects to /[org]/admin/feedback
/[org]/admin/feedback          → admin feedback management (auth-gated)
/[org]/admin/changelog         → admin changelog editor (auth-gated)
/[org]/admin/roadmap           → admin roadmap kanban (auth-gated)
/[org]/admin/settings          → org settings, API keys, webhooks (auth-gated)
/api/v1/orgs/[org]/...         → REST API (Bearer token)
/api/auth/create-org           → POST — create org + Supabase user
/api/auth/signout              → POST — sign out
/api/widget/[org]/config       → GET — widget config (public)
/api/widget/[org]/identify     → POST — verify widget JWT
/cdn/v1/sdk.js                 → static widget bundle (Phase 5)
```

---

## Key Files

### Packages
- `packages/db/prisma/schema.prisma` — full Prisma schema (11 models)

### Apps/web
- `apps/web/app/globals.css` — all CSS custom properties (design tokens)
- `apps/web/app/layout.tsx` — root layout, fonts, ThemeProvider
- `apps/web/middleware.ts` — rate limiting + admin route protection
- `apps/web/lib/prisma.ts` — singleton PrismaClient
- `apps/web/lib/supabase/server.ts` — server Supabase client
- `apps/web/lib/supabase/client.ts` — browser Supabase client
- `apps/web/lib/supabase/middleware.ts` — session refresh helper
- `apps/web/lib/auth.ts` — verifyAdminAccess(), verifyApiKey()
- `apps/web/lib/api.ts` — RFC 9457 error helpers, cursor pagination
- `apps/web/lib/jwt.ts` — widget JWT verify, webhook HMAC
- `apps/web/lib/rate-limit.ts` — Upstash rate limiter instances
- `apps/web/components/ui/` — owned shadcn/ui components
- `apps/web/components/layout/sidebar.tsx` — admin sidebar
- `apps/web/components/layout/topbar.tsx` — public pages topbar (Feedback/Changelog/Roadmap nav)

### Phase 2 — Feedback Board
- `apps/web/app/[org]/feedback/page.tsx` — public feedback board page (Server Component)
- `apps/web/app/[org]/feedback/feedback-board.tsx` — client board with filters, search, post list, modals
- `apps/web/app/[org]/admin/feedback/page.tsx` — admin page (Server Component, loads posts+categories)
- `apps/web/app/[org]/admin/feedback/admin-feedback-client.tsx` — admin table with status, pin, bulk, categories
- `apps/web/components/feedback/post-card.tsx` — public post card with vote + status
- `apps/web/components/feedback/vote-button.tsx` — optimistic vote toggle
- `apps/web/components/feedback/status-badge.tsx` — colored status badge
- `apps/web/components/feedback/post-form.tsx` — submit feedback form (dialog)
- `apps/web/components/feedback/post-detail.tsx` — post detail with comments (dialog)
- `apps/web/app/api/v1/orgs/[org]/posts/route.ts` — GET list, POST create
- `apps/web/app/api/v1/orgs/[org]/posts/[id]/route.ts` — GET, PATCH (admin), DELETE (admin)
- `apps/web/app/api/v1/orgs/[org]/posts/[id]/vote/route.ts` — POST vote, DELETE unvote (dedup logic)
- `apps/web/app/api/v1/orgs/[org]/posts/[id]/comments/route.ts` — GET list, POST create
- `apps/web/app/api/v1/orgs/[org]/posts/[id]/comments/[commentId]/route.ts` — DELETE (admin)
- `apps/web/app/api/v1/orgs/[org]/categories/route.ts` — GET list, POST create (admin)
- `apps/web/app/api/v1/orgs/[org]/categories/[id]/route.ts` — DELETE (admin)

### Phase 3 — Changelog
- `apps/web/app/[org]/admin/changelog/page.tsx` — admin list with create button
- `apps/web/app/[org]/admin/changelog/new/page.tsx` — new entry page (wraps ChangelogEditor)
- `apps/web/app/[org]/admin/changelog/[id]/page.tsx` — edit page (wraps ChangelogEditor)
- `apps/web/components/changelog/changelog-editor.tsx` — client editor: title, slug, label, status, Tiptap
- `apps/web/components/changelog/tiptap-editor.tsx` — Tiptap toolbar + editor (Bold/Italic/Code/CodeBlock/Link/H2/H3/List/Blockquote)
- `apps/web/components/changelog/changelog-entry.tsx` — public card + LabelBadge component
- `apps/web/components/changelog/subscribe-button.tsx` — email subscribe modal (env-gated)
- `apps/web/app/[org]/changelog/page.tsx` — public list, year/month grouped
- `apps/web/app/[org]/changelog/[slug]/page.tsx` — single post with server-rendered HTML (generateHTML)
- `apps/web/app/[org]/changelog/rss.xml/route.ts` — RSS 2.0 feed
- `apps/web/app/[org]/changelog/confirm/page.tsx` — subscription confirmation page (HMAC token verify)
- `apps/web/app/api/v1/orgs/[org]/changelog/route.ts` — GET list, POST create
- `apps/web/app/api/v1/orgs/[org]/changelog/[slug]/route.ts` — GET, PATCH (publish + email), DELETE
- `apps/web/app/api/v1/orgs/[org]/changelog/subscribe/route.ts` — POST subscribe (double opt-in)

### Tiptap packages (Phase 3)
- `@tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-code-block @tiptap/html`
- `@tiptap/html` — server-side `generateHTML()` for public post page + RSS feed

### Phase 4 — Roadmap
- `apps/web/app/[org]/roadmap/page.tsx` — public 3-column kanban (Server Component), mobile snap scroll
- `apps/web/app/[org]/admin/roadmap/page.tsx` — admin page (Server Component, loads items + all feedback posts)
- `apps/web/components/roadmap/roadmap-card.tsx` — card: title, vote count, "From feedback" link, admin hide/delete controls
- `apps/web/components/roadmap/kanban-column.tsx` — column with count badge, snap-start for mobile, empty state
- `apps/web/components/roadmap/admin-roadmap-client.tsx` — full dnd-kit drag-and-drop kanban, promote modal, standalone create, visibility toggle
- `apps/web/app/api/v1/orgs/[org]/roadmap/route.ts` — GET grouped by status, POST create (admin)
- `apps/web/app/api/v1/orgs/[org]/roadmap/[id]/route.ts` — PATCH (status/position/visible/title, syncs feedback post status), DELETE

### Phase 5 — Embeddable Widget
- `apps/widget/package.json` — `@freebase/widget` workspace, Vite build
- `apps/widget/vite.config.ts` — IIFE lib mode, `fileName: () => "sdk.js"`, esbuild minify
- `apps/widget/src/index.ts` — `window.Freebase` command queue boot, dispatches init/identify/open/getUnreadCount
- `apps/widget/src/api.ts` — fetch helpers, base URL, JWT header attachment via `X-Freebase-User`
- `apps/widget/src/styles.ts` — full CSS string injected via `<style>` tag, CSS vars for theming
- `apps/widget/src/feedback.ts` — floating pencil button + slide-in panel (380px) + form + success state
- `apps/widget/src/changelog.ts` — "What's new" button + unread badge (localStorage) + popup (360×480px)
- `apps/widget/src/roadmap.ts` — roadmap floating button (stacked above feedback) + slide-in panel + read-only kanban
- `apps/web/app/api/widget/[org]/config/route.ts` — GET org name/accentColor/categories (public, no auth)
- `apps/web/app/api/widget/[org]/identify/route.ts` — POST verify JWT, rate limited 60/min
- `apps/web/public/cdn/v1/sdk.js` — built bundle (6.2 kB gzip, <20KB limit)
- `apps/web/components/widget-demo.tsx` — `"use client"` component that loads `/cdn/v1/sdk.js` and calls `window.Freebase('init', {...})` on mount; used by the marketing page for live dogfood demo
- **Env var:** `NEXT_PUBLIC_WIDGET_DEMO_ORG` — set to an org slug → marketing homepage shows live widget; unset → no widget (safe default)

**Phase 5 build commands:**
```bash
pnpm --filter @freebase/widget build
cp apps/widget/dist/sdk.js apps/web/public/cdn/v1/sdk.js
# Verify size:
gzip -c apps/web/public/cdn/v1/sdk.js | wc -c   # must be < 20480
```

**Widget command queue pattern (how `window.Freebase` works before script loads):**
```html
<script>
  window.Freebase = window.Freebase || function(...a) { (window.Freebase.q = window.Freebase.q || []).push(a); };
  window.Freebase('init', { org: 'acme' });
</script>
<script src="/cdn/v1/sdk.js" async></script>
```
SDK boots → drains the `.q` queue → replaces the stub.

### dnd-kit packages (Phase 4)
- `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- Drag within column: `SortableContext` + `useSortable` + `CSS.Transform`
- Drag cross-column: `DragOverlay` + `onDragOver` mutates state, `onDragEnd` persists via PATCH
- Status sync: when roadmap item status changes + `feedbackPostId` set → `prisma.feedbackPost.update({ status })`

---

## Design Tokens (from FRONTEND_DESIGN.md)

Dark mode defaults. All via CSS custom properties on `:root`.

Key colors:
- Background: `#0e0e10`
- Surface: `#141416`
- Border: `#2a2a2d`
- Text primary: `#e2e2e5`
- Text secondary: `#a1a1aa`
- Accent: `#10b981` (emerald-500)

Typography: 14px base (Inter), Cal Sans for headings/marketing.
Border radius: sharp — 2px badges, 4px buttons/inputs, 6px cards, 8px modals.
No drop shadows on dark mode — use borders.

---

## Database Notes

- **Neon pooled** (`DATABASE_URL`) — used by Prisma at runtime via PgBouncer
- **Neon direct** (`DATABASE_URL_UNPOOLED`) — used for migrations only

Run migrations:
```bash
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm --filter db prisma migrate dev --name <description>
```

Generate Prisma client after schema changes:
```bash
pnpm db:generate
```

Push schema without migration (dev only):
```bash
pnpm db:push
```

---

## Auth Notes

- **Supabase Auth only** — `users` table in Neon has `id = Supabase Auth UID`
- Admin access check: `verifyAdminAccess(orgSlug)` in `lib/auth.ts`
  - Verifies Supabase session → looks up user in Neon → checks org.slug matches route
- API key check: `verifyApiKey(authHeader, orgSlug)` in `lib/auth.ts`
  - SHA-256 hashes incoming key → looks up in `api_keys` table → checks org match
- Widget JWT: `verifyWidgetJwt(token, secretKey)` in `lib/jwt.ts`
  - HMAC-SHA256 signed by host app using org's `secretKey`

---

## API Notes

- All REST endpoints: `/api/v1/orgs/[org]/...`
- Error format: RFC 9457 Problem Details (`application/problem+json`)
- Pagination: cursor-based (`encodeCursor` / `decodeCursor` in `lib/api.ts`)
- Rate limiting runs in `middleware.ts` before route handlers
- Helpers: `errors.*` and `ok()` in `lib/api.ts`

---

## Voting Dedup (Phase 2)

Priority order (check in this sequence):
1. JWT identified — `userId` from widget `identify` call → `user_id + post_id` unique
2. Email known — from request body → `voterEmail + post_id` unique
3. Anonymous — `SHA256(IP + User-Agent + orgId)` → `voterFingerprint + post_id` unique

At least one of the three unique constraints will always be set.

---

## Email Strategy (Phase 3)

Changelog email subscriptions only work when `EMAIL_FROM_DOMAIN` env var is set.
- Not set → hide "Subscribe" button entirely, show admin notice in settings
- Set → full Resend integration, double opt-in, send on publish
- Resend free: 3,000/month, 100/day, 1 domain

---

## Widget Notes (Phase 5)

- Built in `apps/widget/` — Vite library mode, vanilla TS, no framework deps
- After build: copy `apps/widget/dist/sdk.js` → `apps/web/public/cdn/v1/sdk.js`
- Served from `/cdn/v1/sdk.js` — Vercel CDN-cached static file
- Bundle size check: `gzip -c apps/web/public/cdn/v1/sdk.js | wc -c` — must be < 20480

**How to start Phase 5 (if session compacted):**

Read first: `CLAUDE.md` + `research/PLAN.md` Phase 5 section + `research/INTEGRATION.md` + `research/FRONTEND_DESIGN.md` widget spec

Packages to install:
```bash
# In apps/widget (new Vite workspace):
pnpm --filter widget add -D vite typescript
```

Key new files:
- `apps/widget/package.json` — `"name": "@freebase/widget"`, `"main": "dist/sdk.js"`, build script
- `apps/widget/vite.config.ts` — library mode, `entry: "src/index.ts"`, `fileName: "sdk"`, `formats: ["iife"]`
- `apps/widget/src/index.ts` — `window.Freebase` command queue, `init` + `identify` commands
- `apps/widget/src/api.ts` — fetch helpers, attach JWT header when identified
- `apps/widget/src/styles.ts` — CSS string injected via `<style>` tag, CSS vars, NO Tailwind
- `apps/widget/src/feedback.ts` — floating button + slide-in panel + form
- `apps/widget/src/changelog.ts` — "What's new" button + unread badge (localStorage) + popup list
- `apps/widget/src/roadmap.ts` — roadmap in slide-in panel, read-only 3-column
- `apps/web/app/api/widget/[org]/config/route.ts` — GET org config (public, no auth)
- `apps/web/app/api/widget/[org]/identify/route.ts` — POST verify JWT, rate limited 60/min
- `apps/web/public/cdn/v1/sdk.js` — built output (copy from `apps/widget/dist/sdk.js`)

After build: `pnpm --filter widget build && cp apps/widget/dist/sdk.js apps/web/public/cdn/v1/sdk.js`

**Phase 5 gotchas to avoid:**
- No React, no Tiptap, no Tailwind in widget bundle — pure vanilla TS
- `window.Freebase` must use command queue pattern so it works when loaded async
- Widget CSS must use CSS vars matching org accentColor — not hardcoded emerald
- `localStorage` key for unread: `freebase_cl_read_${orgSlug}` — store array of read post IDs

---

## Local Dev Setup

```bash
# Install
pnpm install

# Copy env vars
cp .env.example .env.local
# Fill in: DATABASE_URL, DATABASE_URL_UNPOOLED, NEXT_PUBLIC_SUPABASE_URL,
#          NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

# Run DB migration
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Start dev server
pnpm dev
```

App runs at `http://localhost:3000`.

---

## Research Docs (gitignored, local only)

All decisions are locked in `/research/`:
- `research/PLAN.md` — full product spec, DB schema, URL structure, phases
- `research/FRONTEND_DESIGN.md` — design tokens, components, page-by-page UI spec
- `research/API_SPEC.md` — REST endpoints, rate limiting, webhook delivery
- `research/INTEGRATION.md` — hosted vs self-host, JWT flow, framework examples

**Read these before building any feature.** Never deviate from locked decisions without explicit approval.

---

## Known Issues / TODOs

- [ ] Rate limiting gracefully skipped if Upstash not configured (returns null limiter)
- [x] Phase 2 feedback board — public + admin + API — DONE
- [x] CalSans-SemiBold.woff2 downloaded and wired via `next/font/local` in `app/layout.tsx`
- [x] Tailwind CSS v4 + Turbopack fix — `@tailwindcss/postcss` installed, `postcss.config.mjs` added

## Prisma Client Note (pnpm monorepo)

Schema sets `output = "../../../node_modules/.prisma/client"` so Turbopack can find the generated client.
After any schema change, run: `pnpm --filter db generate`
The generated client lands at repo root `node_modules/.prisma/client/`.

## Tailwind CSS v4 + Turbopack Note

Tailwind v4 requires `@tailwindcss/postcss` plugin — it does NOT auto-integrate with Next.js/Turbopack.
`apps/web/postcss.config.mjs` wires it up. Without this, `@import "tailwindcss"` in `globals.css` only
processes custom CSS; zero utility classes are generated.
