# Freebase — Build Context

This file is the primary context for building Freebase. Read it at the start of every session. Update it after every phase completes.

## Phase Status

- [x] Phase 1 — Monorepo scaffold, Prisma schema, auth, admin shell, marketing page
- [x] Phase 2 — Feedback board (public + admin + voting + comments)
- [ ] Phase 3 — Changelog (Tiptap editor, public page, RSS, email)
- [ ] Phase 4 — Roadmap (kanban, admin promote/drag, public view)
- [ ] Phase 5 — Embeddable widget (Vite bundle, 3 surfaces, JWT identify)
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
