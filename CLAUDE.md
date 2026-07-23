# Freebase — Build Context

This file is the primary context for building Freebase. Read it at the start of every session. Update it after every phase completes.

**Production URL:** https://freebase.vercel.app (main branch auto-deploys to Vercel)

## Phase Status

- [x] Phase 1 — Monorepo scaffold, Prisma schema, auth, admin shell, marketing page
- [x] Phase 2 — Feedback board (public + admin + voting + comments)
- [x] Phase 3 — Changelog (Tiptap editor, public page, RSS, email subscriptions)
- [x] Phase 4 — Roadmap (kanban, admin promote/drag, public view)
- [x] Phase 5 — Embeddable widget (Vite bundle, 3 surfaces, JWT identify)
- [x] Phase 6 — API keys, webhooks, settings, command palette, Docker Compose, README
- [x] Phase 7 — Multi-org accounts (one login, up to 5 organizations, org switcher)

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
- `packages/db/prisma/schema.prisma` — full Prisma schema (12 models)

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
- `apps/widget/src/index.ts` — `window.Freebase` command queue boot, dispatches init/identify/open/getUnreadCount; creates the single launcher via `createLauncher()` and hands each surface's button to it instead of appending buttons directly to `document.body`
- `apps/widget/src/api.ts` — fetch helpers, base URL, JWT header attachment via `X-Freebase-User`
- `apps/widget/src/launcher.ts` — single collapsed launcher button (`.fb-launcher`, message-bubble icon, accent bg) that fans out a speed-dial menu (`.fb-dial`) containing the 3 surface buttons on click; outside-click/Escape collapses; `setUnreadCount(n)` drives the badge shown on the collapsed launcher
- `apps/widget/src/styles.ts` — full CSS string injected via `<style>` tag; unified `.fb-window` class replaces old `.fb-panel` / `.fb-popup` / `.fb-overlay`; scale+translateY open animation via `cubic-bezier(0.16,1,0.3,1)`; `.fb-launcher` + `.fb-dial` + `.fb-btn-dial-item` implement the collapsed-launcher/speed-dial pattern (replaced the old 3-stacked-independent-buttons layout); `@media (max-width: 480px)` turns `.fb-window` into a full-screen bottom sheet and repositions the launcher closer to the screen edge
- `apps/widget/src/feedback.ts` — pencil icon button (now a dial item, no independent fixed position) + `.fb-window` (560px height, bottom:88px) + form + success state; no overlay
- `apps/widget/src/changelog.ts` — bell icon button (dial item) + unread badge (localStorage) shown both on the button itself and relayed via `onUnreadChange` callback to the launcher's collapsed badge + `.fb-window` (500px height)
- `apps/widget/src/roadmap.ts` — map icon button (dial item) + `.fb-window` (580px height) + read-only kanban; no overlay
- `apps/web/app/api/widget/[org]/config/route.ts` — GET org name/accentColor/categories (public, no auth)
- `apps/web/app/api/widget/[org]/identify/route.ts` — POST verify JWT, rate limited 60/min
- `apps/web/public/cdn/v1/sdk.js` — built bundle (~7 kB gzip, <20KB limit)
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

### Phase 7 — Multi-Org Accounts
- `packages/db/prisma/schema.prisma` — `User` no longer holds `orgId`/`role`; new `OrgMember` join table (`userId`, `orgId`, `role`, `@@unique([userId, orgId])`) links a Supabase Auth user to N organizations. `Organization.members OrgMember[]` replaces the old `users User[]` relation.
- `apps/web/lib/auth.ts` — `verifyAdminAccess(orgSlug)` now resolves via `prisma.orgMember.findFirst({ where: { userId, org: { slug: orgSlug } } })` instead of a singular `user.org` lookup; same return shape (`{ user, dbUser, org, role }`) so every existing caller was unaffected. New `getUserMemberships(userId)` — all orgs a user belongs to, used by the login picker and sidebar switcher.
- `apps/web/app/api/auth/me/route.ts` — returns `{ orgs: [{ slug, name }], lastOrgSlug }` — `orgs` is every membership; `lastOrgSlug` is read straight off `user.user_metadata.orgSlug` (the same field the login page and middleware use for the "last active org" auto-redirect below).
- `apps/web/app/(auth)/login/page.tsx` — **auto-lands on the last-active org, no forced picker.** `pickLandingOrg()` prefers `lastOrgSlug` if it's still a valid membership, falling back to the single-org case, falling back to the "Choose an organization" picker only when there's no valid remembered org (first login, or removed from that org). Picker buttons show a per-item loading spinner via `useTransition` (previously had zero feedback, which read as a dead click under DB latency). All org-entry navigation (picker, auto-redirect, `handleLogin`) targets `/{slug}/admin/feedback` directly — not `/{slug}/admin`, which was an extra server redirect hop through `admin/page.tsx` that roughly doubled perceived latency on every login/switch.
- `apps/web/components/layout/sidebar.tsx` / `create-org-dialog.tsx` — a shared `rememberOrg(slug)` helper fires `supabase.auth.updateUser({ data: { orgSlug: slug } })` (fire-and-forget, non-blocking) on every switch and every new-org creation, keeping `user_metadata.orgSlug` fresh — it used to be written once at signup and never updated, so it went stale the moment an account joined a second org.
- `apps/web/middleware.ts` — the two `user_metadata.orgSlug`-based fast-path redirects (`/`, `/new`, `/login` branches) also target `/{orgSlug}/admin/feedback` directly, matching the same redirect-hop removal above.
- `apps/web/app/api/auth/create-org/route.ts` — branches on whether a Supabase session already exists. Signed-out → original full signup flow (creates Supabase user + `Organization` + `User` + `OrgMember` together). Already signed-in → skips Supabase user creation, just adds a new `Organization` + `OrgMember` to the existing account. **Hard cap of 5 organizations per account, enforced server-side** (`prisma.orgMember.count(...)`, returns 400 past the limit) — never trust the client-disabled UI state alone.
- `apps/web/components/layout/sidebar.tsx` — org header converted from a static row into a `DropdownMenu` switcher: lists all memberships (checkmark on active org), "+ New organization" (disabled + tooltip at the 5-org limit) opens `CreateOrgDialog`. Switching orgs is a full page navigation preserving the current subpath (switch while on Settings → lands back on Settings, not bounced to Feedback) — no client-side data merging, each org's data stays fully isolated per-request via the existing `orgId` scoping. Trigger button has an explicit `focus-visible:ring-inset` so the focus ring stays contained within the button instead of bleeding into the nav list below it (it's the only sidebar element wrapped by a Radix `DropdownMenuTrigger`, so it was the only one showing this).
- `apps/web/components/layout/create-org-dialog.tsx` — lightweight add-org dialog (name + auto-slugify) for already-authenticated users, distinct from the full `/new` signup page which still handles the signed-out case unchanged.
- **Stale data on org switch (fixed)**: `SettingsClient`/`AdminFeedbackClient`/`AdminRoadmapClient` all captured server props into `useState(initialProp)` with zero resync — Next.js re-renders a client component in place on a dynamic-segment (`[org]`) change rather than remounting it, so a switched-to org's props arrived but were silently dropped by the frozen `useState` initializer. Fix: each of the three `page.tsx` files passes `key={orgSlug}` to its client component, forcing a clean remount (fresh `useState` initializers) on every org switch. `apps/web/app/[org]/admin/changelog/page.tsx` needed no change — it's a pure Server Component with no client-side state, immune by construction.
- Widget (`apps/widget/*`, `/api/widget/[org]/*`) required **zero changes** — already fully org-slug + per-org-`secretKey` scoped, independent of the dashboard `User` model.
- Existing users migrated via a backfill in the `org_members` migration (one `OrgMember` row created per existing `users.orgId`/`role` before those columns were dropped) — zero action needed from existing accounts, same org access preserved exactly.

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

Seed demo data for `freebase` org (idempotent — safe to re-run):
```bash
DATABASE_URL=$DATABASE_URL DATABASE_URL_UNPOOLED=$DATABASE_URL_UNPOOLED pnpm --filter @freebase/db seed
```

Seed script: `packages/db/prisma/seed.ts` — creates 4 categories, 8 feedback posts, 3 changelog entries, 6 roadmap items.

---

## Auth Notes

- **Supabase Auth only** — `users` table in Neon has `id = Supabase Auth UID`
- **Multi-org (Phase 7)**: one Supabase Auth user can belong to up to 5 organizations via the `org_members` join table (`userId`, `orgId`, `role`). `User` itself carries no org — org membership is always resolved per-request against the URL's `orgSlug`, never cached globally.
- Admin access check: `verifyAdminAccess(orgSlug)` in `lib/auth.ts`
  - Wrapped with `React.cache()` — layout + page both call it, only one DB hit per render
  - Verifies Supabase session → looks up `OrgMember` matching `userId` + `org.slug` → returns `{ user, dbUser, org, role }`
- All memberships for the switcher/picker: `getUserMemberships(userId)` in `lib/auth.ts`
- API key check: `verifyApiKey(authHeader, orgSlug)` in `lib/auth.ts`
  - SHA-256 hashes incoming key → looks up in `api_keys` table → checks org match (unaffected by multi-org — API keys are always org-scoped, never account-scoped)
- Widget JWT: `verifyWidgetJwt(token, secretKey)` in `lib/jwt.ts`
  - HMAC-SHA256 signed by host app using org's `secretKey`

### Login redirect — last-active-org auto-redirect, picker as fallback only

Logged-in users visiting `/login`, `/`, or `/new` are redirected via two mechanisms, both landing on `/{org}/admin/feedback` directly (not `/{org}/admin` — that extra hop through `admin/page.tsx`'s own `redirect()` roughly doubled perceived latency on every login/switch, now removed everywhere):

1. **Middleware (fast path)** — checks `user?.user_metadata?.orgSlug`. This is a **redirect hint only, never load-bearing for authz** — `user_metadata` is client-writable and Supabase docs explicitly warn against trusting it for access control. Actual authorization always re-verifies against the DB in `verifyAdminAccess`. Fires at the Edge before the page renders.
2. **Client-side `useEffect` (reliable fallback)** — login page calls `/api/auth/me` on mount, which returns `{ orgs: [...], lastOrgSlug }`. `pickLandingOrg()` (in `login/page.tsx`) prefers `lastOrgSlug` if it's still a valid membership, then falls back to the single-org case, then finally to the "Choose an organization" picker — only shown when there's truly no valid remembered org (first login, or the account was removed from that org). Picker buttons show a per-item spinner while pending (previously had zero loading feedback, which read as a dead click under DB latency).

`user_metadata.orgSlug` is kept fresh via a shared `rememberOrg(slug)` helper (fire-and-forget `supabase.auth.updateUser({ data: { orgSlug } })`) called on every: signup (`create-org` route), org switch (sidebar switcher), and new-org creation (`create-org-dialog`) — not just at initial signup like before, so multi-org accounts land on whichever org they were last active in, not always the first one they created.

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
- `apps/widget/src/launcher.ts` — single collapsed launcher button + speed-dial fan-out for the 3 surface buttons, unread badge
- `apps/widget/src/styles.ts` — CSS string injected via `<style>` tag, CSS vars, NO Tailwind
- `apps/widget/src/feedback.ts` — pencil dial-item button + slide-in panel + form
- `apps/widget/src/changelog.ts` — bell dial-item button + unread badge (localStorage) + popup list
- `apps/widget/src/roadmap.ts` — map dial-item button + slide-in panel, read-only 3-column
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

- [x] Rate limiting gracefully skipped if Upstash not configured (returns null limiter) — by design, intentional dev-friendly behavior
- [x] Delete org Supabase user cleanup uses dynamic import of `@supabase/supabase-js` admin client — works but not tree-shaken; acceptable for a rare operation
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
- [x] Pre-deployment security fixes: vote DELETE rate limiting, comment DELETE revalidateTag cache invalidation, roadmap GET auth fixed to use verifyAdminOrApiKey (API keys now work), NEXT_PUBLIC_APP_URL required (no localhost default — fails fast on misconfigured deploy)
- [x] Widget: 3 independent floating buttons (feedback/changelog/roadmap) collapsed into a single launcher (`apps/widget/src/launcher.ts`) that fans out a speed-dial menu on click — fixes excessive screen space usage, especially on mobile. Unread badge (changelog only) now shown on both the collapsed launcher and the changelog dial-item icon. `@media (max-width: 480px)` turns `.fb-window` into a full-screen bottom sheet. Gotcha fixed during implementation: outside-click-to-close must use `e.composedPath()` snapshot, not live `.contains()` checks — the launcher's `innerHTML` icon swap on click detaches the click's own target node mid-bubble, so a live `.contains()` check misreads the click as "outside" and immediately re-closes the dial it just opened. Same fix applied to feedback.ts, changelog.ts, and roadmap.ts's outside-click listeners for consistency — all 4 widget surfaces now use `composedPath()`, not just the launcher. Also fixed: closing a surface panel that was opened from the dial now resets the dial's own open state too (`setSurfaceOpen(false)` clears `dialOpen`), so the launcher collapses back down instead of staying stuck visually fanned-out with nothing open.
- [x] Multi-org accounts (Phase 7): one Supabase Auth account can now own up to 5 organizations via the `org_members` join table, switchable from a sidebar dropdown with zero re-login. Existing users backfilled with zero disruption (verified in prod DB — both pre-existing accounts kept identical single-org access after migration). Widget required zero changes since it was already org-slug + per-org-secretKey scoped, independent of the dashboard `User` model. 5-org cap enforced server-side in `create-org` route (400 response), not just via disabled UI — verified by calling the API directly past the UI gate. Full end-to-end browser verification done: switcher, create-org dialog, data isolation between orgs, login picker for 2+ orgs, and the limit itself.
- [x] Fix: admin pages (feedback, roadmap, settings) showed stale data from the previous org right after switching. Root cause: `SettingsClient`/`AdminFeedbackClient`/`AdminRoadmapClient` all captured server props into `useState(initialProp)` with no resync — React re-renders these in place on an `[org]` param change rather than remounting, so the newly-switched org's props arrived but were dropped by the frozen `useState` initializer. Fix: `key={orgSlug}` on each client component forces a clean remount per org switch. `changelog/page.tsx` needed no fix — it's a pure Server Component, immune by construction. Verified in-browser both directions on all three affected pages.
- [x] Fix: login/switch felt slow, and the "Choose an organization" picker's buttons did nothing visible on click. Root cause was Neon DB latency (1.5–2.5s per query at the time, unrelated to app code) compounded by two separate app-side issues: (1) every org-entry navigation went through `/{slug}/admin` → `redirect()` → `/{slug}/admin/feedback`, an extra full server round trip now removed everywhere (picker, sidebar switcher, middleware, create-org dialog all target `/admin/feedback` directly); (2) the picker buttons had zero loading feedback, now show a per-item spinner via `useTransition`. Also redesigned the login UX per user request: instead of forcing the picker on every multi-org login, a `rememberOrg()` helper keeps `user_metadata.orgSlug` fresh on every switch/login/create (previously written once at signup and never updated), so the login page auto-lands on the last-active org and only shows the picker when there's no valid remembered org.
- [x] Fix: sidebar org-switcher trigger button had an unstyled focus ring that bled downward into the nav list below it — it was the only sidebar element wrapped by a Radix `DropdownMenuTrigger`, so the only one exposing this. Added `focus-visible:ring-inset` to keep the ring contained within the button.
- [x] Security: widget origin allowlist. Previously any third-party site could embed any org's widget just by knowing its (public, non-secret) slug — all 7 widget-facing routes hardcoded `Access-Control-Allow-Origin: "*"` with zero validation of the calling page. Added `Organization.allowedOrigins String[] @default([])` — empty means unrestricted (matches prior behavior exactly, zero-risk default). New shared `apps/web/lib/cors.ts` (`corsHeaders()`, `checkOriginAllowed()`) replaces the 7 duplicated inline `corsHeaders` consts across `posts/route.ts`, `posts/[id]/vote/route.ts`, `posts/[id]/comments/route.ts`, `changelog/route.ts`, `roadmap/route.ts`, `api/widget/[org]/config/route.ts`, `api/widget/[org]/identify/route.ts`. `checkOriginAllowed()` only rejects (403, no CORS headers on the rejection so the browser blocks the attacker page from reading it) when an `Origin` header IS present AND the org's allowlist is non-empty AND nothing matches — same-origin/server-to-server calls (no `Origin` header) and orgs that haven't opted in are never affected. Settings → Allowed Origins UI (`AllowedOriginsSection.tsx`) added, bundled into the existing Organization save flow (`useOrgSettings.ts`). Demo org (`freebase`, used for the live widget on both `localhost:3000` and `https://freebase.vercel.app`) seeded via a new **non-destructive** `packages/db/prisma/set-allowed-origins.ts` (`pnpm --filter db set-origins`) — deliberately kept separate from the existing `seed.ts`, which wipes and reseeds all feedback/changelog/roadmap data and must never be run against production for this purpose.

## Prisma Client Note (pnpm monorepo)

Schema sets `output = "../../../node_modules/.prisma/client"` so Turbopack can find the generated client.
After any schema change, run: `pnpm --filter db generate`
The generated client lands at repo root `node_modules/.prisma/client/`.

**Import path:** Always import from `@prisma/client`, NOT `.prisma/client`. The `.prisma/client` path is an internal generated directory — importing it directly fails on Vercel. `@prisma/client` re-exports all types and is the correct public API.

## Tailwind CSS v4 + Turbopack Note

Tailwind v4 requires `@tailwindcss/postcss` plugin — it does NOT auto-integrate with Next.js/Turbopack.
`apps/web/postcss.config.mjs` wires it up. Without this, `@import "tailwindcss"` in `globals.css` only
processes custom CSS; zero utility classes are generated.
