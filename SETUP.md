# Freebase — Setup & Test Guide

This document is updated after every phase. At the end of all 6 phases, follow this guide top to bottom to get the app running and verify everything works.

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

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the values:

```env
DATABASE_URL="postgresql://..."          # Neon pooled
DATABASE_URL_UNPOOLED="postgresql://..."  # Neon direct (migrations only)

NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."

RESEND_API_KEY=""           # leave blank to disable email
EMAIL_FROM_DOMAIN=""        # leave blank to disable email

NEXT_PUBLIC_APP_URL="http://localhost:3000"
FREEBASE_API_SECRET="generate-with-openssl-rand-hex-32"
```

Generate the API secret:
```bash
openssl rand -hex 32
```

---

## Install & Run

```bash
# Install all dependencies
pnpm install

# Run database migration (creates all tables in Neon)
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm db:migrate

# Generate Prisma client
pnpm db:generate

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
4. Redirected to `/[your-slug]/admin/feedback`
5. Admin sidebar visible: Feedback / Changelog / Roadmap / Settings
6. `/login` — login with the email/password from step 3 → redirected to admin
7. Theme toggle in sidebar works (dark/light)
8. Unauthenticated access to `/[slug]/admin` → redirects to `/login`

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

### Phase 4 — Roadmap

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
14. Linked feedback post: after drag to "In Progress" → go to admin feedback → post shows "in-progress" status

**Public roadmap (after admin actions):**

15. Item marked visible → appears on public roadmap
16. Item marked hidden (Hide) → does NOT appear on public roadmap
17. Promoted item with feedbackPostId → shows "From feedback ↗" link on public card
18. Standalone item → no "From feedback" link shown
19. Vote count on public card matches feedback post's real vote count

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

1. Three floating buttons appear bottom-right: feedback (pencil), changelog ("What's new"), roadmap (map icon)
2. Feedback button click → slide-in panel opens (380px wide)
3. Panel shows form: title, description, optional category, email
4. Submit form with valid title (5+ chars) + email → post appears in admin feedback board
5. Submit with short title → inline validation error shown
6. Changelog "What's new" button shows unread badge (emerald circle with number)
7. Click "What's new" → popup appears (360×480px) with recent changelog entries
8. Popup shows label badge, date per entry; click entry → opens full post in new tab
9. Close popup → reopen → badge gone (localStorage marked all as read)
10. Roadmap button click → slide-in panel opens with three-column kanban (read-only)
11. Roadmap columns show Planned / In Progress / Done with card titles and vote counts
12. Close buttons and overlay click both close panels
13. Theme auto-detects system preference (light/dark)

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
14. After identify, submit feedback → post in admin shows `test@example.com` as author (not anon)

**Bundle size check:**
```bash
gzip -c apps/web/public/cdn/v1/sdk.js | wc -c  # must be < 20480
```
15. Size is ~6200 bytes (well under limit)

**Widget API endpoints:**
16. `curl http://localhost:3000/api/widget/YOUR_SLUG/config` → 200 JSON with name/accentColor/categories
17. `curl -X POST -H "Content-Type: application/json" -d '{"jwt":"bad"}' http://localhost:3000/api/widget/YOUR_SLUG/identify` → 401 unauthorized

**Live widget on marketing page (dogfood demo):**
18. Add `NEXT_PUBLIC_WIDGET_DEMO_ORG=your-slug` to `.env.local`
19. Visit `http://localhost:3000` — three floating buttons appear bottom-right
20. All 3 surfaces work exactly as they would on any host app
21. Without env var → no widget, marketing page unchanged

---

### Phase 6 — API Keys, Webhooks, Settings ✅

**Settings page (`/[org]/admin/settings`):**

1. Navigate to `/[org]/admin/settings` — page loads with sections: Organization, Widget Secret Key, API Keys, Webhooks, Email, Danger Zone
2. Edit org name → click Save → name updates immediately
3. Change accent color (color picker) → Save → color updates
4. Widget Secret Key section → click eye icon → key revealed → copy button works
5. Click "Regenerate secret" → confirm dialog → key regenerated (old widget JWTs invalidated)
6. Email section shows green dot if `RESEND_API_KEY` + `EMAIL_FROM_DOMAIN` set, grey dot otherwise
7. Danger zone: type org slug in input → Delete button activates → click → org deleted → redirect to `/`

**API Keys:**

8. Click "New key" → name input → Create → raw key shown once in modal with copy button
9. Click "Done" → key appears in list with prefix (`fb_live_xxxx…`) + "Never used"
10. Use the key: `curl -H "Authorization: Bearer <key>" http://localhost:3000/api/v1/orgs/[slug]/posts` → 200
11. After use → "Last used" date updates
12. Delete key → confirm → key removed from list → same curl → 401

**Webhooks:**

13. Click "Add webhook" → fill URL + secret (min 8 chars) + select events → Add
14. Webhook appears in list with event badges + Active status toggle
15. Click "Active" badge → toggles to "Paused" → webhook delivery skipped
16. Trigger an event (e.g. change a feedback post status) → webhook delivers to your endpoint
17. Verify signature on your receiver: `X-Freebase-Signature` header = `sha256=<hmac>`
18. Delete webhook → removed from list

**Command palette:**

19. Press `⌘K` (or `Ctrl+K`) anywhere in admin → palette opens
20. Type 2+ chars (e.g. "dark mode") → searches live feedback posts → results appear above nav items
21. Click a post result → navigates to admin feedback
22. Clear search → shows Navigate / Create / Public pages groups
23. `Esc` closes palette
24. Click "Search…" button in sidebar footer → also opens palette

**REST API (non-admin access via API key):**

25. `curl -H "Authorization: Bearer fb_live_xxx" http://localhost:3000/api/v1/orgs/[slug]/posts` → 200 with data
26. `curl -H "Authorization: Bearer fb_live_xxx" -X POST -H "Content-Type: application/json" -d '{"title":"API test","authorEmail":"test@example.com"}' http://localhost:3000/api/v1/orgs/[slug]/posts` → 201

**Docker (self-host):**

27. `docker compose up -d` → app starts at `http://localhost:3000`
28. `docker compose exec web sh -c "DATABASE_URL=\$DATABASE_URL_UNPOOLED npx prisma migrate deploy"` → migrations run
29. App fully functional without Neon (uses bundled Postgres)

---

## Useful Commands

```bash
pnpm dev              # start Next.js dev server (localhost:3000)
pnpm build            # production build
pnpm db:migrate       # run pending Prisma migrations (use with DATABASE_URL_UNPOOLED)
pnpm db:generate      # regenerate Prisma client after schema changes
pnpm db:studio        # open Prisma Studio (DB GUI at localhost:5555)
pnpm db:push          # push schema without migration (dev only, use with care)
```

---

## Self-Host with Docker (Phase 6)

Docker Compose setup will be added in Phase 6. Will support single `docker compose up -d` deployment with Postgres included.

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
