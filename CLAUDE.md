# Freebase — Build Context

This file is the primary context for building Freebase. Read it at the start of every session. Update it after every phase completes.

## Phase Status

- [x] Phase 1 — Monorepo scaffold, Prisma schema, auth, admin shell, marketing page
- [x] Phase 2 — Feedback board (public + admin + voting + comments)
- [x] Phase 3 — Changelog (Tiptap editor, public page, RSS, email subscriptions)
- [x] Phase 4 — Roadmap (kanban, admin promote/drag, public view)
- [x] Phase 5 — Embeddable widget (Vite bundle, 3 surfaces, JWT identify)
- [x] Phase 6 — API keys, webhooks, settings, command palette, Docker Compose, README

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
| Nav progress bar | nextjs-toploader |

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
- `apps/web/lib/prisma.ts` — singleton PrismaClient (imports `lib/env` at startup as validation gate)
- `apps/web/lib/env.ts` — Zod env validation at module-load time; throws on missing required vars before any route runs
- `apps/web/lib/logger.ts` — structured logging: JSON in prod, readable in dev; replaces all console.error in API routes
- `apps/web/lib/supabase/server.ts` — server Supabase client
- `apps/web/lib/supabase/client.ts` — browser Supabase client
- `apps/web/lib/supabase/middleware.ts` — session refresh helper
- `apps/web/lib/auth.ts` — verifyAdminAccess() wrapped with React.cache() (per-request memoized), verifyApiKey(), verifyAdminOrApiKey() (session-first, API-key fallback — used by all write/admin API routes)
- `apps/web/lib/data.ts` — unstable_cache wrappers for all page data. Admin: getFeedbackPageData, getChangelogPageData, getRoadmapPageData, getSettingsPageData. Public: getOrgBySlug (300s TTL), getPublicFeedbackPageData, getPublicChangelogPageData, getPublicRoadmapPageData (30s TTL) — all tagged for revalidation
- `apps/web/lib/api.ts` — RFC 9457 error helpers, cursor pagination
- `apps/web/lib/jwt.ts` — widget JWT verify, webhook HMAC
- `apps/web/lib/rate-limit.ts` — Upstash rate limiter instances
- `apps/web/components/ui/` — owned shadcn/ui components (includes `copy-button.tsx`, `section-header.tsx`, `field-info.tsx`)
- `apps/web/app/docs/page.tsx` — public /docs page (Server Component, no auth); Widget Setup, API Keys, Webhooks, Changelog sections
- `apps/web/components/feedback/category-chip.tsx` — shared category color chip (`${color}18` alpha pattern)
- `apps/web/components/layout/sidebar.tsx` — admin sidebar
- `apps/web/components/layout/topbar.tsx` — public pages topbar (Feedback/Changelog/Roadmap nav); accepts `accentColor` (injects CSS vars), `logoUrl`, `wide` props
- `apps/web/components/layout/page-hero.tsx` — org identity zone between topbar + main; shows orgName, subtitle, accent bar; fade-in animation; accepts `accentColor`, `wide`, `actions` props
- `apps/web/lib/color.ts` — `darkenHex(hex)` utility; used by topbar for `--accent-hover` CSS var

### Phase 2 — Feedback Board
- `apps/web/app/[org]/feedback/page.tsx` — public feedback board page (Server Component)
- `apps/web/app/[org]/feedback/feedback-board.tsx` — client board with filters, search, post list, modals
- `apps/web/app/[org]/admin/feedback/page.tsx` — admin page (Server Component, loads posts+categories)
- `apps/web/app/[org]/admin/feedback/admin-feedback-client.tsx` — thin shell (~150 lines); composes hooks + sub-components
- `apps/web/app/[org]/admin/feedback/hooks/` — useFeedbackPosts, useMultiSelect, useDeleteConfirmation, useBulkActions, useDetailModal, useCategoryManagement + shared types
- `apps/web/app/[org]/admin/feedback/components/` — FeedbackTableRow, BulkActionsBar, PostDetailModal, CategoryManagementDialog, DeleteConfirmDialog
- `apps/web/app/[org]/admin/error.tsx` — Next.js error boundary for admin layout (sidebar stays up)
- `apps/web/app/[org]/admin/feedback/error.tsx` — error boundary scoped to feedback page
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
- `apps/web/app/[org]/changelog/[slug]/page.tsx` — single post with server-rendered HTML (generateHTML); passes `accentColor` to Topbar; OG article metadata with tiptap excerpt
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
- `apps/widget/src/styles.ts` — full CSS string injected via `<style>` tag; unified `.fb-window` class replaces old `.fb-panel` / `.fb-popup` / `.fb-overlay`; scale+translateY open animation via `cubic-bezier(0.16,1,0.3,1)`
- `apps/widget/src/feedback.ts` — floating pencil button + `.fb-window` (560px height, bottom:88px) + form + success state; no overlay
- `apps/widget/src/changelog.ts` — "What's new" button + unread badge (localStorage) + `.fb-window` (500px height)
- `apps/widget/src/roadmap.ts` — roadmap floating button (stacked above feedback) + `.fb-window` (580px height) + read-only kanban; no overlay
- `apps/web/app/api/widget/[org]/config/route.ts` — GET org name/accentColor/categories (public, no auth)
- `apps/web/app/api/widget/[org]/identify/route.ts` — POST verify JWT, rate limited 60/min
- `apps/web/public/cdn/v1/sdk.js` — built bundle (6.2 kB gzip, <20KB limit)
- `apps/web/components/widget-demo.tsx` — `"use client"` component that loads `/cdn/v1/sdk.js` and calls `window.Freebase('init', {...})` on mount; mounted in **root layout** (`apps/web/app/layout.tsx`) — NOT the marketing page — so it persists across all routes including admin
- **Env var:** `NEXT_PUBLIC_WIDGET_DEMO_ORG` — set to an org slug → widget loads on all pages; unset → no widget (safe default)

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

### Marketing & Public Page Polish (post-Phase 6)
- `apps/web/app/(marketing)/` — full redesign: `MarketingNav`, `Hero` (dot grid + radial glow + stagger entrance), `FeatureSection`, `HowItWorks`, `WidgetSnippet`, `ComparisonTable`, `FinalCta` — all in `components/marketing/`
- `apps/web/components/marketing/hero.tsx` — radial glow + dot grid background; `motion` staggered entrance (badge→h1→p→buttons→trust, delays 0/0.08/0.16/0.22/0.28)
- Public pages (`feedback`, `changelog`, `roadmap`) — all use `<PageHero>` + `accentColor` from DB injected into topbar CSS vars; full `generateMetadata` with description + OG + Twitter cards
- `apps/web/app/robots.ts` — blocks `/admin /api/ /login /new` from crawlers, points to sitemap
- `apps/web/app/sitemap.ts` — static marketing routes (`/` + `/new`)
- `apps/web/app/manifest.ts` — PWA manifest, `theme_color: "#10b981"`, standalone
- `apps/web/app/opengraph-image.tsx` — 1200×630 dark OG card (two-square logo mark + wordmark + accent bar)
- `apps/web/app/layout.tsx` — `metadataBase`, full `openGraph` + `twitter` blocks; `og:title` template `%s | Freebase`

### Phase 6 — API Keys, Webhooks, Settings, Docker
- `apps/web/app/[org]/admin/settings/page.tsx` — Server Component: loads org, API keys, webhooks; passes `emailEnabled` flag; renders SettingsClient
- `apps/web/app/[org]/admin/settings/settings-client.tsx` — thin shell (~110 lines); composes hooks + sub-components
- `apps/web/app/[org]/admin/settings/hooks/` — useOrgSettings, useSecretKey, useApiKeys, useWebhooks, useConfirmDialog + shared types (ConfirmAction tagged union, ALL_EVENTS)
- `apps/web/app/[org]/admin/settings/components/` — OrganizationSection, SecretKeySection, ApiKeysList, WebhooksList, DangerZoneSection, ConfirmActionDialog, CreateApiKeyDialog, CreateWebhookDialog
- `apps/web/app/api/v1/orgs/[org]/api-keys/route.ts` — GET list, POST create (returns raw key once in response)
- `apps/web/app/api/v1/orgs/[org]/api-keys/[id]/route.ts` — DELETE
- `apps/web/app/api/v1/orgs/[org]/webhooks/route.ts` — GET list, POST create (secret stored as SHA-256 hash)
- `apps/web/app/api/v1/orgs/[org]/webhooks/[id]/route.ts` — PATCH (active toggle), DELETE
- `apps/web/app/api/v1/orgs/[org]/settings/route.ts` — GET org settings, PATCH (name, accentColor, regenerateSecret), DELETE (cascades all data + deletes Supabase auth user)
- `apps/web/lib/webhooks.ts` — `dispatchWebhook(orgId, payload)` fire-and-forget, retry schedule: immediate → 30s → 5min → 30min → 2hr
- `apps/web/components/layout/command-palette.tsx` — cmdk `⌘K` palette: 2+ char query → live feedback post search via `/api/v1/orgs/[org]/posts?q=...`; empty query → nav/create/public-pages groups
- `docker-compose.yml` — Postgres + web service, single `docker compose up -d`
- `Dockerfile` — multi-stage: deps → widget build → web build → standalone runner
- `apps/web/next.config.ts` — `output: "standalone"` when `DOCKER_BUILD=true`; `staleTimes: { dynamic: 300, static: 300 }` for Router Cache

**Settings page sections (in order):**
1. Organization — name (editable), slug (read-only), accent color (color picker)
2. Widget Secret Key — reveal/hide toggle, copy, regenerate (invalidates all widget JWTs)
3. API Keys — list with prefix + last used, create (raw key shown once), delete
4. Webhooks — list with events + active toggle, create (URL + secret + events multi-select), delete
5. Email Subscriptions — status indicator: green if `RESEND_API_KEY` + `EMAIL_FROM_DOMAIN` set, grey otherwise
6. Danger Zone — type org slug to confirm, then delete (cascades all records + Supabase user)

**Webhook events wired:**
- `post.created` → `posts/route.ts` POST
- `post.status_changed` → `posts/[id]/route.ts` PATCH
- `comment.created` → `posts/[id]/comments/route.ts` POST
- `changelog.published` → `changelog/[slug]/route.ts` PATCH (when status flips draft→published)

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
  - Wrapped with `React.cache()` — layout + page both call it, only one DB hit per render
  - Verifies Supabase session → looks up user in Neon → checks org.slug matches route
- API key check: `verifyApiKey(authHeader, orgSlug)` in `lib/auth.ts`
  - SHA-256 hashes incoming key → looks up in `api_keys` table → checks org match
- Widget JWT: `verifyWidgetJwt(token, secretKey)` in `lib/jwt.ts`
  - HMAC-SHA256 signed by host app using org's `secretKey`

### Login redirect — two-layer approach

Logged-in users visiting `/login`, `/`, or `/new` are redirected to `/{org}/admin` via two mechanisms:

1. **Middleware (fast path)** — checks `user?.user_metadata?.orgSlug`. Works for users created after `create-org` started writing this metadata. Fires at the Edge before the page renders.
2. **Client-side `useEffect` (reliable fallback)** — login page calls `/api/auth/me` on mount; if response includes `orgSlug`, calls `router.replace`. Works for ALL users regardless of when they registered. Shows a spinner while the check is in flight.

`create-org` route now writes `user_metadata: { orgSlug }` when creating Supabase users so new users also get the fast middleware path.

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
1. JWT identified — `userId` extracted from `X-Freebase-User` header (verified HMAC JWT, not request body) → `user_id + post_id` unique
2. Email known — from request body → `voterEmail + post_id` unique
3. Anonymous — `SHA256(IP + User-Agent + orgId)` → `voterFingerprint + post_id` unique

At least one of the three unique constraints will always be set.
`userId` from request body was removed (security fix) — only trusted JWT header is used.

---

## Email Strategy (Phase 3)

Email subscription UI has been removed from the admin settings page and marketing page.
The API routes, subscribe-button component, and confirm page still exist in the codebase but are not surfaced.
- `EMAIL_FROM_DOMAIN` / `RESEND_API_KEY` env vars are still read by the API if set, but no UI exposes them
- Do not re-add email subscription UI without explicit approval

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

# Copy env vars — MUST be in apps/web/, not repo root
cp .env.example apps/web/.env.local
# Fill in: DATABASE_URL, DATABASE_URL_UNPOOLED, NEXT_PUBLIC_SUPABASE_URL,
#          NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, NEXT_PUBLIC_APP_URL

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
- [ ] Delete org Supabase user cleanup uses dynamic import of `@supabase/supabase-js` admin client — works but not tree-shaken; acceptable for a rare operation
- [x] All 6 product phases complete — v1 ready
- [x] Production hardening (7 phases): data integrity, env validation, API consistency, god component splits, UX polish, a11y, test infrastructure
- [x] Security: 8 vulns fixed (draft changelog exposure, vote dedup bypass, SSRF, email leakage, webhook secret hashing, HTML injection, token expiry, orgSlug naming)
- [x] Security: Tiptap external links get `target="_blank" rel="noopener noreferrer"` via Link extension HTMLAttributes
- [x] Data integrity: settings DELETE reverses order — Supabase auth user deleted FIRST; Prisma delete only runs on success. If auth fails → 500, org untouched
- [x] Performance: React.cache() on verifyAdminAccess, unstable_cache on all admin + public page data, Router Cache TTL 5min, revalidateTag on all mutations
- [x] Observability: structured logging via `lib/logger.ts` (JSON in prod, readable in dev) replaces all console.error in API routes
- [x] Env validation: `lib/env.ts` (Zod) imported in `lib/prisma.ts` — fails at startup with clear message if vars missing
- [x] API consistency: Zod errors normalized to `{ field, message }[]` array across all routes
- [x] Pagination: comments endpoint now cursor-paginated (default 50, max 100) matching posts pattern
- [x] Modularity: admin-feedback-client 788→150 lines (6 hooks + 5 components); settings-client 596→110 lines (5 hooks + 8 components)
- [x] UX: top navigation progress bar (nextjs-toploader), login redirect to org admin (two-layer: middleware + client useEffect), widget button stacking fixed, widget moved to root layout so it persists on admin page refresh
- [x] UX: all native confirm()/window.confirm() replaced with Radix Dialog — settings (regen secret, delete API key, delete webhook), changelog editor (delete entry), roadmap admin (delete item)
- [x] UX: changelog delete shows loading state on button and refreshes list via router.refresh() after deletion
- [x] UX: roadmap DnD fully rewritten — useDroppable on columns (empty columns droppable), dataRef pattern for sync persist read, arrayMove for within-column reorder, PATCH now reliably fires on every drag end
- [x] UX: comment loading skeleton has min-h-[200px] to prevent CLS
- [x] Code quality: CategoryChip component extracts `${color}18` hex-alpha pattern from 4 files; noUnusedLocals + noUnusedParameters enabled in tsconfig
- [x] Tests: vitest@2 + 8 passing tests covering DELETE atomicity, Zod error shape, cursor pagination hasMore/nextCursor, comment POST validation
- [x] Marketing: full redesign — MarketingNav, Hero (dot grid + radial glow + stagger), FeatureSection, HowItWorks, WidgetSnippet, ComparisonTable, FinalCta; scroll-triggered entrance animations via `motion` `whileInView`
- [x] Widget: all 3 surfaces (feedback, changelog, roadmap) unified to `.fb-window` floating window with scale-from-origin animation; removed overlay pattern
- [x] Public pages: `PageHero` component (org name + subtitle + accent bar) on all 3 public pages; `accentColor` injected as CSS vars into topbar; `darkenHex` utility in `lib/color.ts`
- [x] SEO: `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`; `metadataBase` + full OG/Twitter blocks in root layout; `generateMetadata` with description + OG + Twitter on all public org pages + changelog detail
- [x] Copy: em dashes removed from all visible UI text (marketing bullets, footer, auth form labels, admin dialogs); kept in metadata title strings where correct
- [x] API auth: `verifyAdminOrApiKey(request, orgSlug)` in `lib/auth.ts` — session-first, API-key fallback; wired to all write/admin routes (posts PATCH/DELETE, comments DELETE, changelog POST/PATCH/DELETE, roadmap POST/PATCH/DELETE, categories POST/DELETE)
- [x] Widget: roadmap surface re-fetches on every open (removed stale `dataLoaded` flag) — shows live data after admin updates
- [x] UX: TooltipProvider wired into root layout; FieldInfo component (Info icon + Radix tooltip, max 260px); contextual tooltips on Widget Secret Key, API Keys, Webhooks, org slug, changelog slug/label/status, roadmap "From feedback" tab
- [x] Docs: `/docs` page added (public, no auth) — Widget Setup, API Keys, Webhooks, Changelog sections; SDK URL uses NEXT_PUBLIC_APP_URL
- [x] Settings: Email Subscriptions section removed from admin settings UI (emailEnabled prop + Mail import cleaned up)
- [x] Marketing: changelog bullet updated to remove email subscriptions mention; Docs link added to footer
- [x] Sidebar: Help/Docs link (HelpCircle icon) above ⌘K bar

## Prisma Client Note (pnpm monorepo)

Schema sets `output = "../../../node_modules/.prisma/client"` so Turbopack can find the generated client.
After any schema change, run: `pnpm --filter db generate`
The generated client lands at repo root `node_modules/.prisma/client/`.

## Tailwind CSS v4 + Turbopack Note

Tailwind v4 requires `@tailwindcss/postcss` plugin — it does NOT auto-integrate with Next.js/Turbopack.
`apps/web/postcss.config.mjs` wires it up. Without this, `@import "tailwindcss"` in `globals.css` only
processes custom CSS; zero utility classes are generated.
