# Freebase — Setup & Test Guide

This document is updated after every phase. Follow this guide top to bottom to get the app running and verify everything works — all 7 phases plus post-launch hardening (security fixes, UX polish, multi-org accounts, widget origin allowlist).

---

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Git

---

## External Services Required

### 1. Neon (Database)
- Go to [neon.tech](https://neon.tech) → create a project
- From the dashboard, copy two connection strings:
  - **Pooled** (has `?pgbouncer=true`) → `DATABASE_URL`
  - **Direct / Unpooled** (no pgbouncer param) → `DATABASE_URL_UNPOOLED`

### 2. Supabase (Auth only)
- Go to [supabase.com](https://supabase.com) → create a project
- Settings → API → copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Upstash Redis (Rate limiting)
- Go to [upstash.com](https://upstash.com) → create a Redis database (free tier)
- Copy:
  - **REST URL** → `UPSTASH_REDIS_REST_URL`
  - **REST Token** → `UPSTASH_REDIS_REST_TOKEN`

### 4. Resend (Email — optional)
- Only needed for changelog email subscriptions
- Go to [resend.com](https://resend.com) → create account → add API key → verify a domain
- `RESEND_API_KEY` — your Resend API key
- `EMAIL_FROM_DOMAIN` — the verified domain (e.g. `yourdomain.com`)
- **Leave both blank to disable email entirely** — all other features still work

### 5. Cal Sans Font
- Download `CalSans-SemiBold.woff2` from [github.com/calcom/font](https://github.com/calcom/font)
- Place at: `apps/web/fonts/CalSans-SemiBold.woff2`

---

## Environment Setup

Env vars must live in `apps/web/.env.local` — Next.js only reads env files from the app directory, not the repo root.

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local` and fill in the values:

```env
# ─── Neon (Database) ──────────────────────────────────────────────────────────
# Pooled connection — used by Prisma at runtime (PgBouncer)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
# Direct connection — used for Prisma migrations only
DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ─── Supabase (Auth only — no Supabase DB) ────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ─── Upstash Redis (Rate limiting) ────────────────────────────────────────────
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."

# ─── Resend (Email — optional, enables changelog subscriptions) ───────────────
# Leave blank to disable email features entirely
RESEND_API_KEY=""
EMAIL_FROM_DOMAIN=""
# e.g. EMAIL_FROM_DOMAIN=freebase.app → sends from updates@freebase.app

# ─── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ─── Widget self-demo (optional) ──────────────────────────────────────────────
# Set to your org slug to show a live Freebase widget on every page (mounted in
# the root layout — including admin, not just the marketing homepage).
# Leave blank to disable (app works fine without it).
NEXT_PUBLIC_WIDGET_DEMO_ORG=""
```

**Known gap:** `docker-compose.yml` references a `FREEBASE_API_SECRET` env var that isn't currently validated or read anywhere in `apps/web` — likely orphaned from earlier work. Not required for local dev; flagged here as a TODO to either wire up or remove, not something to configure.

---

## Install & Run

```bash
# Install all dependencies
pnpm install

# Run database migration (creates all tables in Neon)
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Optional: seed demo data for a "freebase" org (idempotent — safe to re-run)
# Creates 4 categories, 8 feedback posts, 3 changelog entries, 6 roadmap items
pnpm --filter @freebase/db seed

# Optional: seed allowedOrigins for the demo org (non-destructive, safe to re-run
# anytime — unlike `seed`, this only touches the allowedOrigins field, never
# wipes other data)
pnpm --filter @freebase/db set-origins

# Start dev server
pnpm dev
```

App runs at `http://localhost:3000`

---

## Phase-by-Phase Test Checklist

### Phase 1 — Foundation ✅

1. `http://localhost:3000` — marketing landing page loads
2. `/new` — create org form renders
3. Fill in: org name, slug, email, password → submit
4. Redirected to `/[your-slug]/admin` → auto-redirects to `/[your-slug]/admin/feedback` (two hops today — signup is the one entry point that hasn't been collapsed to a direct redirect yet, unlike login/switcher/middleware)
5. Admin sidebar visible: Feedback / Changelog / Roadmap / Settings
6. `/login` — login with the email/password from step 3 → lands directly on `/[slug]/admin/feedback` (single-org accounts skip any picker)
7. Theme toggle in sidebar works (dark/light)
8. Unauthenticated access to `/[slug]/admin` → redirects to `/login`

See **Phase 7** below for the multi-org login picker (accounts with 2+ organizations).

---

### Phase 2 — Feedback Board ✅

1. `http://localhost:3000/[your-slug]/feedback` — public feedback board loads
2. Topbar shows: org name, Feedback/Changelog/Roadmap tabs, theme toggle
3. Click "Submit feedback" → modal opens with title, description, category, email fields
4. Fill in title (min 5 chars) + email → submit → post appears in list
5. Post card shows: vote count, title, description preview, status badge, comment count
6. Click vote button → count increments (optimistic UI) → refresh → count persists
7. Vote again → 409 conflict → count stays unchanged (dedup working)
8. Click post card → post detail modal opens with full description
9. In detail modal: add a comment with email → comment appears immediately
10. Filter bar: click "Open" tab → only open posts shown
11. Sort dropdown: change to "Newest" → posts reorder
12. Search box: type partial title → results filter in real time (300ms debounce)
13. `http://localhost:3000/[slug]/admin/feedback` — admin table loads
14. Admin: status dropdown on each row → change to "Planned" → badge updates instantly
15. Admin: "Pin to top" via row actions → post gets pin icon → unpinned posts sort below
16. Admin: delete post → confirm dialog → post removed from list
17. Admin: "Manage categories" button → create category with name + color → appears in list
18. Admin: delete category → inline confirm → removed
19. Admin: select multiple posts with checkboxes → choose bulk status → Apply → all update
20. API: `curl http://localhost:3000/api/v1/orgs/[slug]/posts` → 200 JSON with posts array
21. API: `curl -X POST -H "Content-Type: application/json" -d '{"title":"Test","authorEmail":"a@b.com"}' http://localhost:3000/api/v1/orgs/[slug]/posts` → 400 (title too short)
22. API: `curl http://localhost:3000/api/v1/orgs/nonexistent/posts` → 404 problem+json

---

### Phase 3 — Changelog ✅

1. `http://localhost:3000/[slug]/admin/changelog` — admin list loads, shows "No changelog entries yet"
2. Click "New entry" → editor page opens with toolbar, title input, slug/label fields
3. Type a title → slug auto-generates (kebab-case) → slug field updates live
4. Write content in editor: bold, italic, heading, list, code block
5. Click "Save draft" → redirected to edit page (`/admin/changelog/[id]`), status = "Draft"
6. Entry appears in admin list with "Draft" badge
7. Back on edit page, click "Publish" → status badge changes to "Published"
8. `http://localhost:3000/[slug]/changelog` — public list shows the published entry with label badge and date
9. Entry grouped under correct year/month header
10. Click entry card → single post page loads with full rich text (headings, code blocks render correctly)
11. "← Back to changelog" link works
12. `http://localhost:3000/[slug]/changelog/rss.xml` — valid RSS 2.0 XML (open in browser or validate at validator.w3.org/feed)
13. RSS contains correct post title, link, pubDate, description (HTML)
14. Draft posts do NOT appear in public list or RSS
15. API: `curl http://localhost:3000/api/v1/orgs/[slug]/changelog` → 200 with published posts
16. API: `curl http://localhost:3000/api/v1/orgs/[slug]/changelog?status=draft` → 401 (admin only)
17. API: `curl http://localhost:3000/api/v1/orgs/nonexistent/changelog` → 404 problem+json

**Email (only if EMAIL_FROM_DOMAIN + RESEND_API_KEY set):**

18. Subscribe button visible on public changelog page
19. Click → modal opens with email input
20. Enter email → submit → "Confirmation email sent" message
21. Check inbox → click confirm link → confirmation page shows success
22. Publish a new entry → confirmed subscribers receive email with link

**Email gated (without EMAIL_FROM_DOMAIN set):**

23. Subscribe button NOT shown on public changelog page

---

### Phase 4 — Roadmap ✅

**Public roadmap (`/[org]/roadmap`):**

1. Visit `/[org]/roadmap` → page renders three empty columns: Planned / In Progress / Done
2. Each column shows correct empty state text
3. Mobile: columns scroll horizontally and snap to each column on swipe

**Admin roadmap (`/[org]/admin/roadmap`):**

4. Admin sidebar Roadmap link navigates to `/[org]/admin/roadmap`
5. "Add item" button opens modal
6. Modal: select "From feedback" tab → search feedback posts → select one → choose column → Add → card appears
7. Modal: select "Standalone" tab → enter title → choose column → Add → card appears
8. Card shows title and vote count (0 for standalone, real count for promoted post)
9. Card shows "Hide" button → click → card gets 60% opacity, shows eye-off icon
10. "Show" button re-shows card
11. Deleted item (click Delete → confirm) → card removed from board
12. Drag card within same column → reorders → refresh → order persists (PATCH called)
13. Drag card to different column → card moves → status updates → refresh → still in new column
14. Drag card into an **empty** column → drop succeeds and card lands there (empty columns are droppable via `useDroppable` — this was a real regression before the DnD rewrite, worth re-checking specifically)
15. Linked feedback post: after drag to "In Progress" → go to admin feedback → post shows "in-progress" status

**Public roadmap (after admin actions):**

16. Item marked visible → appears on public roadmap
17. Item marked hidden (Hide) → does NOT appear on public roadmap
18. Promoted item with feedbackPostId → shows "From feedback ↗" link on public card
19. Standalone item → no "From feedback" link shown
20. Vote count on public card matches feedback post's real vote count

---

### Phase 5 — Embeddable Widget ✅

**Build the widget first:**
```bash
pnpm --filter @freebase/widget build
cp apps/widget/dist/sdk.js apps/web/public/cdn/v1/sdk.js
```

**Test with a minimal HTML file** (save as `test-widget.html` in repo root):
```html
<!DOCTYPE html>
<html>
<head><title>Widget test</title></head>
<body>
<script>
  window.Freebase = window.Freebase || function(...a) {
    (window.Freebase.q = window.Freebase.q || []).push(a);
  };
  window.Freebase('init', { org: 'YOUR_ORG_SLUG', position: 'bottom-right' });
</script>
<script src="http://localhost:3000/cdn/v1/sdk.js" async></script>
</body>
</html>
```
Open `test-widget.html` in a browser while `pnpm dev` is running.

**Checklist:**

1. A single collapsed launcher button appears bottom-right (or bottom-left, per `position`) — not three separate buttons
2. Click the launcher → it fans out a speed-dial menu with 3 buttons (feedback pencil, changelog bell, roadmap map icon), staggered entrance animation
3. Click Escape or click outside the dial (with nothing open) → dial collapses back
4. Click the feedback dial item → `.fb-window` pops in (scale + translateY animation, not a slide), ~400px wide
5. Panel shows form: title, description, optional category, email
6. Submit form with valid title (5+ chars) + email → post appears in admin feedback board
7. Submit with short title → inline validation error shown
8. Close the feedback window (× button, Escape, or click outside) → window closes and the launcher/dial return to their collapsed state (no overlay element exists — there's nothing separate to click through)
9. Click the changelog dial item → `.fb-window` pops in at ~400×500px with recent changelog entries
10. If there are unread entries, the unread count badge shows in **two places**: on the changelog dial-item icon itself, and on the collapsed launcher button — both should match
11. Popup shows label badge, date per entry; click entry → opens full post in new tab
12. Close popup → reopen → badge gone on both the dial item and the launcher (localStorage marked all as read)
13. Click the roadmap dial item → `.fb-window` pops in with a read-only three-column kanban
14. Roadmap columns show Planned / In Progress / Done with card titles and vote counts
15. Opening one surface (e.g. feedback) while another is open (e.g. changelog) automatically closes the other — only one `.fb-window` is open at a time
16. Theme auto-detects system preference (light/dark)
17. Resize the browser below 480px width (or test on a real mobile device) → `.fb-window` becomes a full-screen bottom sheet instead of a floating window

**JWT identify test:**
```html
<script>
  window.Freebase('identify', {
    userId: 'test_123',
    email: 'test@example.com',
    name: 'Test User',
    jwt: 'YOUR_SIGNED_JWT',
  });
</script>
```
18. After identify, submit feedback → post in admin shows `test@example.com` as author (not anon)

**Bundle size check:**
```bash
gzip -c apps/web/public/cdn/v1/sdk.js | wc -c  # must be < 20480
```
19. Size is a few KB gzipped (measured ~7.2KB as of the last launcher rewrite) — the number will drift slightly release to release; what matters is staying under the 20480-byte limit, not matching an exact figure

**Widget API endpoints:**
20. `curl http://localhost:3000/api/widget/YOUR_SLUG/config` → 200 JSON with name/accentColor/categories
21. `curl -X POST -H "Content-Type: application/json" -d '{"jwt":"bad"}' http://localhost:3000/api/widget/YOUR_SLUG/identify` → 401 unauthorized

**Live widget demo (dogfooding, mounted in the root layout):**
22. Add `NEXT_PUBLIC_WIDGET_DEMO_ORG=your-slug` to `apps/web/.env.local`
23. Visit `http://localhost:3000` — the collapsed launcher appears bottom-right
24. Navigate to `/[your-slug]/admin/feedback` (or any other route) — the launcher still appears; it's mounted in the root layout, not just the marketing homepage, so it persists across every route including admin
25. All 3 surfaces work exactly as they would on any host app
26. Without the env var set → no widget, app unchanged

See **Widget Origin Allowlist** below for embedding restrictions.

---

### Phase 6 — Settings, API Keys, Webhooks ✅

**Settings page (`/[org]/admin/settings`):**

1. Navigate to `/[org]/admin/settings` — page loads with sections in this order: Organization, Allowed Origins, Widget Secret Key, API Keys, Webhooks, Danger Zone
2. Edit org name → click Save → name updates immediately
3. Change accent color (color picker) → Save → color updates
4. Widget Secret Key section → click eye icon → key revealed → copy button works
5. Click "Regenerate secret" → confirm dialog → key regenerated (old widget JWTs invalidated)
6. Danger zone: type org slug in input → Delete button activates → click → org deleted → redirect to `/`

**API Keys:**

7. Click "New key" → name input → Create → raw key shown once in modal with copy button
8. Click "Done" → key appears in list with prefix (`fb_live_xxxx…`) + "Never used"
9. Use the key: `curl -H "Authorization: Bearer <key>" http://localhost:3000/api/v1/orgs/[slug]/posts` → 200
10. After use → "Last used" date updates
11. Delete key → confirm → key removed from list → same curl → 401

**Webhooks:**

12. Click "Add webhook" → fill URL + secret (min 8 chars) + select events → Add
13. Webhook appears in list with event badges + Active status toggle
14. Click "Active" badge → toggles to "Paused" → webhook delivery skipped
15. Trigger an event (e.g. change a feedback post status) → webhook delivers to your endpoint
16. Verify signature on your receiver: `X-Freebase-Signature` header = `sha256=<hmac>`
17. Delete webhook → removed from list

**Command palette:**

18. Press `⌘K` (or `Ctrl+K`) anywhere in admin → palette opens
19. Type 2+ chars (e.g. "dark mode") → searches live feedback posts → results appear above nav items
20. Click a post result → navigates to admin feedback
21. Clear search → shows Navigate / Create / Public pages groups
22. `Esc` closes palette
23. Click "Search…" button in sidebar footer → also opens palette

**REST API (non-admin access via API key):**

24. `curl -H "Authorization: Bearer fb_live_xxx" http://localhost:3000/api/v1/orgs/[slug]/posts` → 200 with data
25. `curl -H "Authorization: Bearer fb_live_xxx" -X POST -H "Content-Type: application/json" -d '{"title":"API test","authorEmail":"test@example.com"}' http://localhost:3000/api/v1/orgs/[slug]/posts` → 201

**Docker (self-host):**

26. `docker compose up -d` → app starts at `http://localhost:3000`
27. `docker compose exec web sh -c "DATABASE_URL=\$DATABASE_URL_UNPOOLED npx prisma migrate deploy"` → migrations run
28. App fully functional without Neon (uses bundled Postgres)

---

### Phase 7 — Multi-Org Accounts ✅

One Supabase Auth account can own and switch between up to 5 organizations.

1. While logged into an org, click the org name at the top of the sidebar → dropdown opens listing all orgs the account belongs to, with a checkmark on the active one
2. Click "+ New organization" → dialog opens with just a name field (auto-slugified) — no email/password needed, unlike the signed-out `/new` signup flow
3. Create a second org → switcher now shows both; switching preserves the current subpath (e.g. switch while on Settings → lands back on Settings for the new org, not bounced to Feedback)
4. Switch orgs → confirm Feedback, Settings, and Roadmap pages all show the newly-selected org's data, not stale data left over from the previous org
5. Directly visit `/{other-org-slug}/admin/feedback` in the URL bar (without using the switcher) → access works via membership check, not just switcher-driven navigation
6. Create organizations until the account owns 5 → "+ New organization" becomes disabled with a tooltip explaining the limit
7. Confirm the 5-org cap is enforced **server-side**, not just the disabled button: call `POST /api/auth/create-org` directly past the 5th org → 400, even if you could bypass the disabled UI
8. Full logout, then log back in with an account that owns 2+ orgs → "Choose an organization" picker appears; each option shows a loading spinner while switching
9. Log in with an account that owns exactly 1 org, or an account that has a valid remembered last-active org → skips the picker entirely, lands directly on `/{org}/admin/feedback`

---

### Widget Origin Allowlist ✅

By default, any website can embed any org's widget just by knowing its (public, non-secret) slug. `Settings → Allowed Origins` lets an org restrict which domains may embed it.

1. Navigate to `/[org]/admin/settings` — confirm the "Allowed Origins" section shows an empty list with a visible warning that any site can currently embed the widget
2. Add an origin (e.g. `https://example.com`) → Save
3. `curl -H "Origin: https://not-example.com" http://localhost:3000/api/widget/[org]/config` → 403, no CORS headers on the response (so the browser blocks a real attacker page from reading even the error body)
4. `curl -H "Origin: https://example.com" http://localhost:3000/api/widget/[org]/config` → 200, matches the allowlist
5. `curl http://localhost:3000/api/widget/[org]/config` (no `Origin` header at all — simulating a server-to-server or curl call) → 200, always allowed regardless of allowlist state
6. With the allowlist still configured, visit the org's own public feedback board in a browser and submit feedback / vote / add a comment → all succeed, because the app's own origin (`NEXT_PUBLIC_APP_URL`) is always exempted from the allowlist check, even though it's a same-origin browser request that does send an `Origin` header
7. Remove all origins from the list (back to empty) → confirm the org is fully unrestricted again (regression check for the safe default)
8. `pnpm --filter @freebase/db set-origins` — seeds `localhost:3000` + the production URL into the demo (`freebase`) org's allowlist; re-run anytime, it only touches this one field

---

## Useful Commands

```bash
pnpm dev                              # start Next.js dev server (localhost:3000)
pnpm build                            # production build
pnpm db:migrate                       # run pending Prisma migrations (use with DATABASE_URL_UNPOOLED)
pnpm db:generate                      # regenerate Prisma client after schema changes
pnpm db:studio                        # open Prisma Studio (DB GUI at localhost:5555)
pnpm db:push                          # push schema without migration (dev only, use with care)
pnpm --filter @freebase/db seed       # seed demo data for the "freebase" org (idempotent, destructive re-seed of that org's content)
pnpm --filter @freebase/db set-origins  # seed allowedOrigins for the demo org (non-destructive, safe anytime)
```

---

## Self-Host with Docker

```bash
cp .env.example .env
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# NEXT_PUBLIC_APP_URL (your public domain, e.g. http://localhost:3000 for local)
# Optional: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
# Optional: RESEND_API_KEY, EMAIL_FROM_DOMAIN, NEXT_PUBLIC_WIDGET_DEMO_ORG
# DATABASE_URL and DATABASE_URL_UNPOOLED are set automatically by docker-compose

docker compose up -d

# Run migrations (first time only)
docker compose exec web sh -c "DATABASE_URL=\$DATABASE_URL_UNPOOLED npx prisma migrate deploy"
```

App runs at `http://localhost:3000`. Postgres is bundled — no Neon needed for local Docker.

---

## Troubleshooting

**`DATABASE_URL_UNPOOLED` error during migration**
Make sure you're passing it explicitly:
```bash
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm db:migrate
```

**Prisma client out of sync**
After any schema change, run:
```bash
pnpm db:generate
```

**Cal Sans font not loading**
Download `CalSans-SemiBold.woff2` and place at `apps/web/fonts/CalSans-SemiBold.woff2`. The font file is not included in the repo.

**Rate limiting not working in dev**
If Upstash env vars are not set, rate limiting is silently skipped. This is intentional — set the vars to enable it.

**Email subscribe button not showing**
Expected. `EMAIL_FROM_DOMAIN` env var must be set with a Resend-verified domain. Leave blank to disable the feature.

**Tailwind CSS utility classes not applying (everything unstyled)**
Tailwind v4 requires `@tailwindcss/postcss`. Make sure `apps/web/postcss.config.mjs` exists with:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```
If missing, `@import "tailwindcss"` in `globals.css` only processes custom CSS — zero utility classes are generated. Clear `.next/` and restart dev server after adding it.

**Widget embeds unexpectedly blocked with a 403 after configuring Allowed Origins**
Check that the calling page's exact origin (scheme + host + port, no path or trailing slash) is in the org's Allowed Origins list. Requests with no `Origin` header, and requests from the app's own `NEXT_PUBLIC_APP_URL`, are always allowed regardless of the list — only third-party embed origins need to be added.
