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

### Phase 3 — Changelog (coming)

_Will be added after Phase 3 is complete._

---

### Phase 4 — Roadmap (coming)

_Will be added after Phase 4 is complete._

---

### Phase 5 — Embeddable Widget (coming)

_Will be added after Phase 5 is complete._

---

### Phase 6 — API Keys, Webhooks, Settings, Launch (coming)

_Will be added after Phase 6 is complete._

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
