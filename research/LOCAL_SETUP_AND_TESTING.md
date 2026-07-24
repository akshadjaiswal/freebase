# Freebase — Local Setup & End-to-End Testing Guide

Complete guide for setting up all external services, configuring env vars, and testing every feature of Freebase — all 7 phases plus post-launch hardening (multi-org accounts, widget origin allowlist, security fixes).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [External Service Setup](#2-external-service-setup)
   - [Neon (Database)](#21-neon-database)
   - [Supabase (Auth)](#22-supabase-auth)
   - [Upstash Redis (Rate Limiting)](#23-upstash-redis-rate-limiting)
   - [Resend (Email — optional)](#24-resend-email--optional)
   - [Cal Sans Font](#25-cal-sans-font)
3. [Environment Setup](#3-environment-setup)
4. [Install, Migrate & Run](#4-install-migrate--run)
5. [Feature Testing](#5-feature-testing)
   - [Phase 1 — Org Creation & Auth](#51-phase-1--org-creation--auth)
   - [Phase 2 — Feedback Board](#52-phase-2--feedback-board)
   - [Phase 3 — Changelog](#53-phase-3--changelog)
   - [Phase 4 — Roadmap](#54-phase-4--roadmap)
   - [Phase 5 — Embeddable Widget](#55-phase-5--embeddable-widget)
   - [Phase 6 — Settings, API Keys, Webhooks, Command Palette](#56-phase-6--settings-api-keys-webhooks-command-palette)
   - [Phase 7 — Multi-Org Accounts](#57-phase-7--multi-org-accounts)
   - [Widget Origin Allowlist](#58-widget-origin-allowlist)
6. [REST API curl Reference](#6-rest-api-curl-reference)
7. [Webhook Signature Verification](#7-webhook-signature-verification)
8. [Docker Self-Host](#8-docker-self-host)
9. [Unit Tests](#9-unit-tests)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 20 | `nvm install 20` or [nodejs.org](https://nodejs.org) |
| pnpm | >= 9 | `npm install -g pnpm` |
| Git | any | pre-installed on macOS |

Verify:
```bash
node -v      # should print v20.x.x or higher
pnpm -v      # should print 9.x.x or higher
```

---

## 2. External Service Setup

You need accounts on **Neon**, **Supabase**, and **Upstash**. All have generous free tiers that cover local dev and small production deployments. Resend is optional — only needed if you want changelog email subscriptions on the public changelog page (note: the admin Settings page no longer shows an Email Subscriptions section either way — see [Phase 6](#56-phase-6--settings-api-keys-webhooks-command-palette)).

---

### 2.1 Neon (Database)

Neon is a serverless Postgres provider. Freebase uses it as the primary database via Prisma.

**Steps:**

1. Go to [neon.tech](https://neon.tech) → **Sign up** (GitHub login is fastest)
2. Click **New project** → give it a name (e.g. `freebase-dev`) → choose a region closest to you → **Create project**
3. You land on the project dashboard. Find the **Connection Details** panel.
4. In the connection string dropdown, make sure **Pooled connection** is selected (it shows `?pgbouncer=true` in the URL).
5. Copy that connection string — this is your `DATABASE_URL`.
6. Switch the dropdown to **Direct connection** (no `pgbouncer` param). Copy that string — this is your `DATABASE_URL_UNPOOLED`.

Both strings look like:
```
postgresql://username:password@ep-xxx-yyy.us-east-2.aws.neon.tech/neondb?sslmode=require
```

The pooled one has an additional `pgbouncer=true&connect_timeout=10` suffix.

**Why two URLs?**
- `DATABASE_URL` (pooled) — used by Prisma at runtime via PgBouncer connection pooler. Efficient for many short-lived serverless requests.
- `DATABASE_URL_UNPOOLED` (direct) — used only for `prisma migrate` commands. Prisma migrations require a direct connection, not a pooled one.

---

### 2.2 Supabase (Auth)

Freebase uses **Supabase Auth only** — not the Supabase database. The entire data layer is in Neon via Prisma. Supabase just handles email+password authentication.

**Steps:**

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in
2. Click **New project** → choose your organization → fill in:
   - **Name:** `freebase-dev` (or anything)
   - **Database Password:** set a strong password (not used by the app, but required by Supabase)
   - **Region:** same region as your Neon database
3. Wait ~2 minutes for the project to provision.
4. In the sidebar, go to **Project Settings** → **API**:
   - Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL` (looks like `https://abcdefgh.supabase.co`)
   - Copy **Project API keys → anon / public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY` (starts with `eyJ`)
   - Click **Reveal** next to **service_role** key → copy it → this is `SUPABASE_SERVICE_ROLE_KEY` (starts with `eyJ`)

   > **Warning:** The `service_role` key has admin privileges. It's used server-side only (in `lib/auth.ts` and the delete-org route). Never expose it in client code.

5. Go to **Authentication** → **Providers** → **Email**:
   - Turn **Enable Email Confirmations** → **OFF**
   - This lets you log in immediately without clicking a confirmation email during local dev.

6. Go to **Authentication** → **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`
   - Under **Redirect URLs**, add `http://localhost:3000/**`

---

### 2.3 Upstash Redis (Rate Limiting)

Upstash provides a serverless Redis instance used for rate limiting via `@upstash/ratelimit`.

**Steps:**

1. Go to [upstash.com](https://upstash.com) → **Sign up** → **Create database**
2. Select **Redis** → name it `freebase-dev` → choose **Global** or the region closest to you → **Create**
3. On the database dashboard, find the **REST API** section:
   - Copy **UPSTASH_REDIS_REST_URL** (looks like `https://xxx.upstash.io`)
   - Copy **UPSTASH_REDIS_REST_TOKEN** (long alphanumeric string)

> **Note:** If you skip Upstash, rate limiting is silently disabled — the app still works perfectly. You'll see a console warning but no errors. Set it up when you want to test rate limiting behavior.

---

### 2.4 Resend (Email — optional)

Only needed to test changelog email subscriptions (subscribe, confirm, receive on publish) on the **public** changelog page.

**Steps:**

1. Go to [resend.com](https://resend.com) → **Sign up**
2. **API Keys** → **Create API Key** → name it `freebase-dev` → **Add** → copy the key → `RESEND_API_KEY`
3. **Domains** → **Add Domain** → enter your domain (must be a real domain you control) → follow DNS verification steps
4. Once verified, the domain name (e.g. `yourdomain.com`) → `EMAIL_FROM_DOMAIN`
5. Freebase sends email from `changelog@{EMAIL_FROM_DOMAIN}` and `noreply@{EMAIL_FROM_DOMAIN}`

**Resend free tier:** 3,000 emails/month, 100/day, 1 custom domain.

**To skip email entirely:** leave `RESEND_API_KEY` and `EMAIL_FROM_DOMAIN` blank. The subscribe button is hidden on the public changelog page and no emails are sent.

---

### 2.5 Cal Sans Font

The marketing page uses Cal Sans for headings. The font file is not included in the repo.

**Steps:**

1. Go to github.com/calcom/font → **Releases** → find the latest release → download `CalSans-SemiBold.woff2`
2. Place it at: `apps/web/fonts/CalSans-SemiBold.woff2`

Without the font: marketing page headings fall back to Inter. The app runs normally — you'll see a Next.js font warning in the console.

---

## 3. Environment Setup

Env vars must live in `apps/web/.env.local` — Next.js only reads env files from the app directory, not the repo root.

```bash
cp .env.example apps/web/.env.local
```

Then open `apps/web/.env.local` and fill in every value:

```env
# ── Database (Neon) ─────────────────────────────────────────────────────────────
# Pooled connection string — Prisma uses this at runtime via PgBouncer
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=10"

# Direct connection string — used ONLY for prisma migrate commands
DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ── Auth (Supabase) ─────────────────────────────────────────────────────────────
# Project URL from Project Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL="https://abcdefgh.supabase.co"

# anon/public key from Project Settings → API → Project API keys → anon
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# service_role key from Project Settings → API → Project API keys → service_role (reveal it)
# SERVER-SIDE ONLY — never expose in client code
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ── Rate Limiting (Upstash Redis) ────────────────────────────────────────────────
# REST URL from Upstash database dashboard → REST API section
UPSTASH_REDIS_REST_URL="https://xxx-yyy-zzz.upstash.io"

# REST Token from Upstash database dashboard → REST API section
UPSTASH_REDIS_REST_TOKEN="AXxxxxxxxxxxxxxxxxxxxxxxxx"

# ── App ──────────────────────────────────────────────────────────────────────────
# Local dev URL — change to your production URL when deploying
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── Email (Resend — leave blank to disable email features) ──────────────────────
RESEND_API_KEY=""
EMAIL_FROM_DOMAIN=""

# ── Widget demo (optional) ───────────────────────────────────────────────────────
# Set to your org slug to show the live widget across the whole app (mounted in
# the root layout — every route, including admin, not just the marketing page).
# Leave blank — app works normally without a widget.
NEXT_PUBLIC_WIDGET_DEMO_ORG=""
```

**Known gap — do not add this:** an earlier version of this doc instructed you to generate and set a `FREEBASE_API_SECRET` var (used only by `docker-compose.yml`). Confirmed by grepping the entire `apps/web` app: nothing reads this variable — it's orphaned. Skip it; nothing in local dev or the app itself depends on it.

---

## 4. Install, Migrate & Run

Run these commands from the repo root:

```bash
# Install all dependencies (web app + widget + db package)
pnpm install

# Run database migrations — creates all tables in Neon
# IMPORTANT: use DATABASE_URL_UNPOOLED here, not DATABASE_URL
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm db:migrate

# Generate Prisma client (creates type-safe DB client)
pnpm db:generate

# Optional: seed demo data for a "freebase" org (idempotent — safe to re-run)
# Creates 4 categories, 8 feedback posts, 3 changelog entries, 6 roadmap items
pnpm --filter @freebase/db seed

# Optional: seed allowedOrigins for the demo org (non-destructive, safe to re-run
# anytime — unlike `seed`, only touches the allowedOrigins field)
pnpm --filter @freebase/db set-origins

# Start the dev server (Next.js + Turbopack)
pnpm dev
```

App runs at **http://localhost:3000**

Expected output from `pnpm dev`:
```
▲ Next.js 15.x.x (Turbopack)
- Local: http://localhost:3000
- Ready in Xs
```

---

## 5. Feature Testing

Replace `[slug]` in all URLs with the org slug you create in Phase 1.

---

### 5.1 Phase 1 — Org Creation & Auth

**Create an org:**

1. Visit `http://localhost:3000` → marketing page loads with headline and feature cards
2. Click **Get started free** → navigates to `/new`
3. Fill in:
   - **Org name:** `Acme Inc`
   - **Slug:** `acme` (auto-generated from name, editable, lowercase + hyphens only)
   - **Email:** your email
   - **Password:** 8+ characters
4. Click **Create organization** → redirects to `/acme/admin` → auto-redirects to `/acme/admin/feedback` (two hops — org creation is currently the one entry point that still goes through this extra redirect; login/switcher/middleware all land directly on `/admin/feedback`)
5. Admin sidebar visible with: Feedback / Changelog / Roadmap / Settings

**Verify in DB (optional):**
```bash
pnpm db:studio
# Opens Prisma Studio at localhost:5555
# Check: organizations table has 1 row with slug = "acme"
# Check: users table has 1 row with the Supabase UID as id
# Check: org_members table has 1 row linking that user to that org
```

**Test auth flows:**

6. Visit `http://localhost:3000/acme/admin` → should redirect to `/acme/admin/feedback` (admin works)
7. Open a new incognito window → visit `http://localhost:3000/acme/admin/feedback` → should redirect to `/login`
8. Go to `/login` → enter your email + password → submit → lands directly on `/acme/admin/feedback` (single-org accounts skip any picker — see [Phase 7](#57-phase-7--multi-org-accounts) for the multi-org case)
9. In the admin sidebar, click the theme toggle (sun/moon icon) → theme switches between dark and light
10. Click the **Sign out** button in sidebar footer → redirects to `/login`
11. Log back in before continuing

---

### 5.2 Phase 2 — Feedback Board

#### Public board

1. Visit `http://localhost:3000/acme/feedback` → public feedback board loads
2. Topbar shows: org name, Feedback/Changelog/Roadmap nav tabs, theme toggle
3. Click **Submit feedback** → modal opens
4. Fill in:
   - **Title:** `Dark mode for the dashboard` (must be 5+ chars)
   - **Description:** `The current interface is too bright at night.`
   - **Email:** `user@example.com`
5. Click **Submit** → modal closes → post appears in the list
6. Refresh the page → post still there (persisted)
7. Click the **vote button** (thumbs up / arrow) on the post → count goes from 0 to 1 (optimistic UI)
8. Refresh → count is still 1 (persisted)
9. Click vote again from same browser → count stays at 1 (dedup working — 409 response from API)
10. Open the post card → post detail modal opens showing full description
11. In the modal, add a comment: email `commenter@example.com`, body `Great idea!` → submit → comment appears immediately
12. **Filter test:** Click the **Planned** tab in the filter bar → list empties (no planned posts yet)
13. Click **All** to go back
14. **Sort test:** Change sort to **Newest** in the dropdown → posts reorder by date
15. **Search test:** Type `dark` in the search box → only the "Dark mode" post shows (300ms debounce)

#### Admin board

16. Visit `http://localhost:3000/acme/admin/feedback` → table shows your post
17. Click the status dropdown on the post row → change to **Planned** → badge updates instantly
18. Visit the public feedback board → post now shows a **Planned** status badge
19. In admin, click **⋮** menu → **Pin to top** → post gets a pin icon → appears at top of list
20. Click **⋮** menu → **Unpin** to undo
21. Click **⋮** menu → **Delete** → confirm dialog → post removed

**Categories:**

22. In admin, click **Manage categories** button
23. Create a category: name `UI/UX`, color `#6366f1` (indigo) → **Add**
24. Category appears in list
25. Delete the category → confirm → removed

**Bulk status update:**

26. Create 3 feedback posts via the public board
27. In admin, check the checkbox on all 3 rows
28. Use the bulk action dropdown → select **Mark as Planned** → **Apply**
29. All 3 rows show **Planned** badge

#### API tests

```bash
SLUG=acme

# List posts
curl "http://localhost:3000/api/v1/orgs/$SLUG/posts"

# Create a post
curl -X POST "http://localhost:3000/api/v1/orgs/$SLUG/posts" \
  -H "Content-Type: application/json" \
  -d '{"title":"API test post","authorEmail":"api@test.com"}'

# Create with short title — should return 400
curl -X POST "http://localhost:3000/api/v1/orgs/$SLUG/posts" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hi","authorEmail":"api@test.com"}'

# Non-existent org — should return 404 problem+json
curl "http://localhost:3000/api/v1/orgs/doesnotexist/posts"
# Content-Type: application/problem+json
```

---

### 5.3 Phase 3 — Changelog

#### Admin editor

1. Visit `http://localhost:3000/acme/admin/changelog` → list loads with empty state
2. Click **New entry** → editor page opens
3. Type a title: `Dark mode is here` → slug auto-generates as `dark-mode-is-here` (updates live as you type)
4. In the editor body, write some content:
   - Type a heading, press Enter, type a paragraph
   - Select text → click **B** (bold) → text bolds
   - Click the `</>` icon → insert a code block → type some code
5. Select a **Label**: `feature`
6. Click **Save draft** → redirects to edit page `/admin/changelog/[id]`, status badge shows **Draft**
7. Back on list: entry shows with **Draft** badge

**Publish:**

8. Open the entry → click **Publish** → status changes to **Published**, `publishedAt` is set

#### Public changelog

9. Visit `http://localhost:3000/acme/changelog` → entry appears with label badge and date
10. Entry is grouped under the correct year/month header
11. Click the entry card → single post page loads at `/acme/changelog/dark-mode-is-here`
12. Rich text renders correctly: headings are larger, code block has monospace font, bold text is bold
13. Click **← Back to changelog** → back to list

**RSS feed:**

14. Visit `http://localhost:3000/acme/changelog/rss.xml` → valid RSS 2.0 XML renders in browser
15. Feed has correct `<title>`, `<link>`, `<item>` elements with the published entry
16. Draft entries do NOT appear in RSS

**Email subscription** (only if Resend configured):

17. Visit public changelog → **Subscribe to updates** button visible
18. Click → modal opens → enter an email → **Subscribe** → "Confirmation email sent" message
19. Check inbox → confirmation email received → click confirm link → redirect to `/acme/changelog/confirm?token=...` → success page
20. Publish another changelog entry → confirmed subscriber receives email with entry link

**Without Resend configured:**

21. Subscribe button should NOT appear on the public changelog page

#### API tests

```bash
# List published changelog entries
curl "http://localhost:3000/api/v1/orgs/$SLUG/changelog"

# Drafts require admin — should return 401
curl "http://localhost:3000/api/v1/orgs/$SLUG/changelog?status=draft"
```

---

### 5.4 Phase 4 — Roadmap

#### Admin roadmap

1. Visit `http://localhost:3000/acme/admin/roadmap` → three-column kanban: **Planned / In Progress / Done**
2. Click **Add item** → modal opens with two tabs: **From feedback** and **Standalone**

**Promote from feedback:**

3. Click **From feedback** tab → search for the feedback posts you created earlier → click one → select **Planned** column → **Add**
4. Card appears in Planned column showing title + vote count

**Standalone item:**

5. Click **Add item** → **Standalone** tab → title `Redesign onboarding flow` → **In Progress** → **Add**
6. Card appears in In Progress column

**Visibility toggle:**

7. On any card, click **Hide** → card gets 60% opacity and eye-off icon
8. Click **Show** → card back to full opacity

**Drag and drop:**

9. Drag a card within the same column → reorders → refresh → order persists
10. Drag a card from **Planned** to **In Progress** → card moves → refresh → still in new column
11. Drag a card into an **empty** column → drop succeeds and card lands there (empty columns are droppable via `useDroppable`, not just a passthrough of the last non-empty column — this was a real regression before the DnD rewrite, worth checking specifically)
12. If the card was promoted from a feedback post, check admin feedback → that post's status now shows **in-progress** (status sync)

**Delete:**

13. Click **Delete** on a card → confirm → card removed

#### Public roadmap

14. Visit `http://localhost:3000/acme/roadmap` → three columns show visible items
15. Hidden items do NOT appear
16. Promoted item shows **From feedback ↗** link
17. Click that link → navigates to admin feedback page (opens in same tab)

**Mobile test:**

18. Open DevTools → toggle mobile emulation (375px width) → roadmap page → columns scroll horizontally and snap per column on swipe

---

### 5.5 Phase 5 — Embeddable Widget

**Build the widget first:**

```bash
pnpm --filter @freebase/widget build
cp apps/widget/dist/sdk.js apps/web/public/cdn/v1/sdk.js
```

**Verify bundle size:**

```bash
gzip -c apps/web/public/cdn/v1/sdk.js | wc -c
# Must be < 20480 bytes (20 KB). Expect a few KB gzipped — the exact figure
# drifts release to release (measured ~7.2KB after the launcher/speed-dial
# rewrite); what matters is staying under the limit, not matching a fixed number.
```

**Create test HTML file** (save as `test-widget.html` in repo root, ignored by git):

```html
<!DOCTYPE html>
<html>
<head><title>Widget Test</title></head>
<body>
<h1>Widget Test Page</h1>
<p>A collapsed launcher button should appear bottom-right.</p>

<script>
  window.Freebase = window.Freebase || function(...a) {
    (window.Freebase.q = window.Freebase.q || []).push(a);
  };
  window.Freebase('init', {
    org: 'acme',       // ← your org slug
    position: 'bottom-right'
  });
</script>
<script src="http://localhost:3000/cdn/v1/sdk.js" async></script>
</body>
</html>
```

Open `test-widget.html` in a browser while `pnpm dev` is running (use `open test-widget.html` on macOS).

**Test checklist:**

1. A single collapsed launcher button appears bottom-right (or bottom-left, per `position`) — not three separate buttons
2. Click the launcher → fans out a speed-dial menu with 3 buttons (feedback pencil, changelog bell, roadmap map icon), staggered entrance animation
3. Press Escape, or click outside the dial with nothing open → dial collapses back
4. Click the feedback dial item → `.fb-window` pops in (scale + translateY animation, not a slide-in), ~400px wide
5. Panel shows form: title, description, category (if any), email
6. Fill title (5+ chars) + email → **Submit** → success state "Thanks!" appears
7. Check admin feedback board → new post appeared with your email as author
8. Submit with short title (< 5 chars) → validation error appears inline, no submission
9. Close the window (× button, Escape, or clicking outside — there's no overlay element to click through) → returns to the collapsed launcher
10. Click the changelog dial item:
    - If you published changelog entries: unread count badge appears in **two places** — on the changelog dial-item icon itself, and on the collapsed launcher button
    - Click → `.fb-window` pops in (~400×500px) showing recent entries with label badges and dates
    - Close popup → reopen → badge is gone in both places (localStorage marked all as read)
11. Click the roadmap dial item → `.fb-window` shows three columns with your roadmap items (read-only)
12. Opening one surface while another is open automatically closes the other — only one window is ever open
13. Resize the browser below 480px width → `.fb-window` becomes a full-screen bottom sheet instead of a floating window

**Theme test:**

14. In browser DevTools → open Console → run:
    ```javascript
    document.documentElement.setAttribute('data-theme', 'light')
    ```
    Widget should switch to light theme.

**JWT identify test** (tests user attribution):

Add to `test-widget.html` before the init call:

```javascript
// First generate a JWT signed with your org's secretKey
// Get secretKey from: GET /api/v1/orgs/acme/settings (admin auth required)
// Then sign with: HMAC-SHA256, alg: HS256, claims: { userId, email, name, orgSlug }

window.Freebase('identify', {
  userId: 'user_123',
  email: 'jane@example.com',
  name: 'Jane Doe',
  jwt: 'YOUR_SIGNED_JWT_HERE',
});
```

After submit: check admin feedback → post author shows `jane@example.com`, not anonymous.

**Widget API endpoints:**

```bash
# Public org config (no auth needed)
curl "http://localhost:3000/api/widget/acme/config"
# Returns: { name, accentColor, categories }

# JWT verify — bad JWT should return 401
curl -X POST "http://localhost:3000/api/widget/acme/identify" \
  -H "Content-Type: application/json" \
  -d '{"jwt":"thisisnotavalidjwt"}'
# Returns: 401 problem+json
```

**Live widget demo (dogfooding, mounted in the root layout):**

```bash
# Add to apps/web/.env.local:
NEXT_PUBLIC_WIDGET_DEMO_ORG=acme

# Restart dev server
pnpm dev

# Visit http://localhost:3000 — the collapsed launcher appears bottom-right
# Navigate to /acme/admin/feedback (or any other route) — the launcher still
# appears; it's mounted in the root layout, not just the marketing homepage.
```

Without the env var, the app has no widget anywhere (expected).

See [Widget Origin Allowlist](#58-widget-origin-allowlist) for embedding restrictions.

---

### 5.6 Phase 6 — Settings, API Keys, Webhooks, Command Palette

#### Settings page

1. Visit `http://localhost:3000/acme/admin/settings`
2. Page loads with sections in this order: Organization, Allowed Origins, Widget Secret Key, API Keys, Webhooks, Danger Zone. (There is no Email Subscriptions section — it was removed from the admin settings UI; the underlying API routes and public-page subscribe button still exist and are covered in [Phase 3](#53-phase-3--changelog).)

**Organization section:**

3. Change **Name** to `Acme Corp` → **Save** → page updates, topbar shows new name
4. Change **Accent color** using the color picker → pick a blue shade → **Save** → accent color updates on public pages

Verify accent color on public page:
5. Visit `/acme/feedback` → vote buttons and active tab should use the new accent color

**Allowed Origins:** see [Widget Origin Allowlist](#58-widget-origin-allowlist) below for the full checklist.

**Widget Secret Key:**

6. Click the **eye icon** → secret key revealed (long hex string)
7. Click **Copy** → key copied to clipboard
8. Click **Regenerate secret** → confirm dialog → new key generated (old widget JWTs are now invalid)

#### API Keys

9. Click **New key** → dialog opens → name: `My App` → **Create**
10. Dialog shows: **Copy your key now — it will not be shown again** + the raw key (starts with `fb_live_`)
11. Copy the key → click **Done**
12. Key appears in list with prefix (`fb_live_a1b2…`) + **Never used** label

**Use the key:**

```bash
API_KEY="fb_live_..."  # paste your raw key here

# Should return 200 with posts list
curl -H "Authorization: Bearer $API_KEY" \
  "http://localhost:3000/api/v1/orgs/acme/posts"

# Create a post via API key
curl -X POST "http://localhost:3000/api/v1/orgs/acme/posts" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Posted via API key","authorEmail":"apiuser@example.com"}'
```

13. After the curl: refresh settings page → key now shows **Last used: just now**

**Delete key:**

```bash
# Reload settings page, get key id from the list (visible in DOM or network tab)
curl -X DELETE "http://localhost:3000/api/v1/orgs/acme/api-keys/KEY_ID_HERE" \
  -H "Authorization: Bearer $API_KEY"
```

Or click **Delete** in the settings UI → confirm → key removed.

14. Try using the deleted key:
```bash
curl -H "Authorization: Bearer $API_KEY" \
  "http://localhost:3000/api/v1/orgs/acme/posts"
# Returns 401
```

#### Webhooks

15. Click **Add webhook** → fill in:
    - **URL:** use [webhook.site](https://webhook.site) — get a free test URL there
    - **Secret:** `mysecret123` (8+ chars)
    - **Events:** check `post.created` and `post.status_changed`
16. Click **Add** → webhook appears in list with event badges and **Active** status

**Trigger a webhook:**

17. Go to public feedback board → submit a new post
18. Go to webhook.site → should see a POST request arrive with:
    - Header: `X-Freebase-Event: post.created`
    - Header: `X-Freebase-Signature: sha256=...`
    - Header: `X-Freebase-Timestamp: ...`
    - Body: JSON with event, timestamp, org, data

**Verify signature** (see [Section 7](#7-webhook-signature-verification) for full example).

**Toggle active:**

19. In settings, click the **Active** badge on the webhook → toggles to **Paused**
20. Submit another feedback post → webhook.site receives nothing
21. Toggle back to **Active**

**Delete:**

22. Click **Delete** on the webhook → confirm → removed from list

#### Command Palette

23. Press **⌘K** (macOS) or **Ctrl+K** (Windows/Linux) anywhere in admin → palette opens
24. Empty state shows three groups: **Navigate**, **Create**, **Public pages**
25. Click **Feedback** → navigates to admin feedback → palette closes
26. Open palette again → type `dark` (2+ chars) → live search results appear from your feedback posts
27. Click a result → navigates to admin feedback → palette closes
28. Press **Esc** → palette closes
29. In the admin sidebar footer, click the **Search…** button → palette opens (same as ⌘K)

#### Danger Zone

> **Important:** Only test this if you want to delete the org. Create a new org afterward.

30. Scroll to **Danger Zone** section in settings
31. The **Delete organization** button is disabled by default
32. Type your org slug (`acme`) in the confirmation input → button enables (turns red)
33. Click **Delete organization** → org deleted → redirected to `/`
34. Try visiting `/acme/admin/feedback` → 404 (org no longer exists)
35. Supabase Auth → Authentication → Users → user is deleted from Supabase

---

### 5.7 Phase 7 — Multi-Org Accounts

One Supabase Auth account can own and switch between up to 5 organizations.

1. While logged into an org, click the org name at the top of the sidebar → dropdown opens listing all orgs the account belongs to, with a checkmark on the active one
2. Click **+ New organization** → dialog opens with just a name field (auto-slugified) — no email/password needed, unlike the signed-out `/new` signup flow
3. Create a second org → switcher now shows both; switching preserves the current subpath (e.g. switch while on Settings → lands back on Settings for the new org, not bounced to Feedback)
4. Switch orgs → confirm Feedback, Settings, and Roadmap pages all show the newly-selected org's data, not stale data left over from the previous org
5. Directly visit `/{other-org-slug}/admin/feedback` in the URL bar (without using the switcher) → access works via membership check, not just switcher-driven navigation
6. Create organizations until the account owns 5 → **+ New organization** becomes disabled with a tooltip explaining the limit
7. Confirm the 5-org cap is enforced **server-side**, not just the disabled button:
   ```bash
   # Repeat past your 5th org — should return 400
   curl -X POST "http://localhost:3000/api/auth/create-org" \
     -H "Content-Type: application/json" \
     -d '{"name":"One Too Many"}'
   # (requires an authenticated session cookie — easiest to just try creating
   # a 6th org through the UI and confirm the API call itself, visible in
   # DevTools Network tab, returns 400 even though the button is disabled)
   ```
8. Full logout, then log back in with an account that owns 2+ orgs → "Choose an organization" picker appears; each option shows a loading spinner while switching
9. Log in with an account that owns exactly 1 org, or an account that has a valid remembered last-active org → skips the picker entirely, lands directly on `/{org}/admin/feedback`

---

### 5.8 Widget Origin Allowlist

By default, any website can embed any org's widget just by knowing its (public, non-secret) slug. Settings → Allowed Origins lets an org restrict which domains may embed it.

1. Navigate to `/acme/admin/settings` — confirm the "Allowed Origins" section shows an empty list with a visible warning that any site can currently embed the widget
2. Add an origin (e.g. `https://example.com`) → Save
3. `curl -H "Origin: https://not-example.com" http://localhost:3000/api/widget/acme/config` → 403, no CORS headers on the response (so a real attacker page's browser is blocked from reading even the error body)
4. `curl -H "Origin: https://example.com" http://localhost:3000/api/widget/acme/config` → 200, matches the allowlist
5. `curl http://localhost:3000/api/widget/acme/config` (no `Origin` header at all — simulating a server-to-server or curl call) → 200, always allowed regardless of allowlist state
6. With the allowlist still configured, visit `/acme/feedback` in a browser and submit feedback / vote / add a comment → all succeed, because the app's own origin (`NEXT_PUBLIC_APP_URL`) is always exempted from the allowlist check, even though it's a same-origin browser request that does send an `Origin` header on POST/DELETE
7. Remove all origins from the list (back to empty) → confirm the org is fully unrestricted again (regression check for the safe default)
8. `pnpm --filter @freebase/db set-origins` — seeds `localhost:3000` + the production URL into the demo (`freebase`) org's allowlist; re-run anytime, it only touches this one field

---

## 6. REST API curl Reference

All examples use `$SLUG` for the org slug and `$API_KEY` for a valid API key (created in settings).

```bash
SLUG=acme
API_KEY=fb_live_...
BASE=http://localhost:3000/api/v1/orgs/$SLUG
```

### Feedback Posts

```bash
# List posts (public, no auth needed)
curl "$BASE/posts"

# List with filters
curl "$BASE/posts?status=open&sort=votes&limit=10"

# Search
curl "$BASE/posts?q=dark+mode"

# Get single post
curl "$BASE/posts/POST_ID"

# Create post (public)
curl -X POST "$BASE/posts" \
  -H "Content-Type: application/json" \
  -d '{"title":"Add keyboard shortcuts","authorEmail":"user@example.com"}'

# Create via API key (omit authorEmail to use key identity)
curl -X POST "$BASE/posts" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"API post","authorEmail":"api@example.com"}'

# Update post status (admin or API key)
curl -X PATCH "$BASE/posts/POST_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"planned"}'

# Delete post (admin or API key)
curl -X DELETE "$BASE/posts/POST_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### Votes

```bash
# Vote on a post
curl -X POST "$BASE/posts/POST_ID/vote" \
  -H "Content-Type: application/json" \
  -d '{"voterEmail":"voter@example.com"}'

# Unvote
curl -X DELETE "$BASE/posts/POST_ID/vote" \
  -H "Content-Type: application/json" \
  -d '{"voterEmail":"voter@example.com"}'
```

### Comments

```bash
# List comments
curl "$BASE/posts/POST_ID/comments"

# Add comment
curl -X POST "$BASE/posts/POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{"body":"This is needed ASAP.","authorEmail":"commenter@example.com"}'

# Delete comment (admin or API key)
curl -X DELETE "$BASE/posts/POST_ID/comments/COMMENT_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### Categories

```bash
# List categories
curl "$BASE/categories"

# Create category (admin or API key)
curl -X POST "$BASE/categories" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mobile","color":"#f59e0b"}'

# Delete category (admin or API key)
curl -X DELETE "$BASE/categories/CATEGORY_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### Changelog

```bash
# List published entries (public)
curl "$BASE/changelog"

# Get single entry
curl "$BASE/changelog/dark-mode-is-here"

# Create entry (admin or API key)
curl -X POST "$BASE/changelog" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Performance improvements","slug":"performance-improvements","label":"improvement","body":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"We improved load times by 40%."}]}]}}'

# Publish entry
curl -X PATCH "$BASE/changelog/performance-improvements" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"published"}'

# Delete entry
curl -X DELETE "$BASE/changelog/performance-improvements" \
  -H "Authorization: Bearer $API_KEY"
```

### Roadmap

```bash
# List roadmap items (grouped by status)
curl "$BASE/roadmap"

# Create roadmap item (admin or API key)
curl -X POST "$BASE/roadmap" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Redesign onboarding","status":"planned"}'

# Update item status
curl -X PATCH "$BASE/roadmap/ITEM_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"in-progress"}'

# Delete item
curl -X DELETE "$BASE/roadmap/ITEM_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### API Keys

```bash
# List keys (admin only)
curl "$BASE/api-keys" \
  -H "Authorization: Bearer $API_KEY"

# Create key (admin only)
curl -X POST "$BASE/api-keys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Production key"}'
# Returns: { rawKey: "fb_live_...", ... } — save this, shown only once

# Delete key (admin only)
curl -X DELETE "$BASE/api-keys/KEY_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### Webhooks

```bash
# List webhooks (admin only)
curl "$BASE/webhooks" \
  -H "Authorization: Bearer $API_KEY"

# Create webhook (admin only)
curl -X POST "$BASE/webhooks" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://webhook.site/xxx","events":["post.created","comment.created"],"secret":"mysecret123"}'

# Toggle active (admin only)
curl -X PATCH "$BASE/webhooks/WEBHOOK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"active":false}'

# Delete webhook (admin only)
curl -X DELETE "$BASE/webhooks/WEBHOOK_ID" \
  -H "Authorization: Bearer $API_KEY"
```

### Org Settings

```bash
# Get settings (admin only)
curl "$BASE/settings" \
  -H "Authorization: Bearer $API_KEY"

# Update name and accent color (admin only)
curl -X PATCH "$BASE/settings" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","accentColor":"#3b82f6"}'

# Regenerate widget secret (invalidates all widget JWTs)
curl -X PATCH "$BASE/settings" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"regenerateSecret":true}'

# Update allowed origins (empty array = unrestricted)
curl -X PATCH "$BASE/settings" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"allowedOrigins":["https://yourapp.com"]}'
```

### Widget Endpoints

```bash
# Public org config (no auth, used by widget SDK)
curl "http://localhost:3000/api/widget/acme/config"

# Verify widget JWT (rate limited 60/min)
curl -X POST "http://localhost:3000/api/widget/acme/identify" \
  -H "Content-Type: application/json" \
  -d '{"jwt":"SIGNED_JWT_HERE"}'
```

---

## 7. Webhook Signature Verification

When you receive a webhook, verify it wasn't tampered with using the secret you set when creating the webhook.

**Delivery headers:**

| Header | Value |
|--------|-------|
| `X-Freebase-Signature` | `sha256=<hmac-hex>` |
| `X-Freebase-Timestamp` | Unix timestamp (seconds) |
| `X-Freebase-Event` | e.g. `post.created` |
| `Content-Type` | `application/json` |

**Signing algorithm:**

```
HMAC-SHA256(key=SHA256(rawSecret), data="${timestamp}.${rawBody}")
```

Where `timestamp` is the value from `X-Freebase-Timestamp` and `rawBody` is the raw request body string (before JSON parsing). The expected signature is `sha256=<hmac-hex>`.

> **Important:** The HMAC key is `SHA256(rawSecret)`, not `rawSecret` directly. Hash your secret before using it as the HMAC key.

**Node.js verification example:**

```javascript
import { createHash, createHmac, timingSafeEqual } from "crypto";

function verifyWebhookSignature(rawBody, timestamp, signature, rawSecret) {
  // Reject if timestamp is more than 5 minutes old (prevents replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
    return false;
  }

  // Hash the raw secret first — server stores SHA256(secret) as signing key
  const key = createHash("sha256").update(rawSecret).digest("hex");

  const expected = createHmac("sha256", key)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedHeader = `sha256=${expected}`;

  try {
    // Constant-time compare to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedHeader)
    );
  } catch {
    return false;
  }
}

// Express.js handler example
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const rawBody = req.body.toString("utf8");  // IMPORTANT: use raw body string
  const signature = req.headers["x-freebase-signature"];
  const timestamp = req.headers["x-freebase-timestamp"];
  const rawSecret = "mysecret123";  // the secret you entered when creating the webhook

  if (!verifyWebhookSignature(rawBody, timestamp, signature, rawSecret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(rawBody);
  console.log("Verified event:", event.event, event.data);
  res.status(200).json({ ok: true });
});
```

**Webhook payload shape:**

```json
{
  "event": "post.created",
  "timestamp": "2026-06-16T10:30:00.000Z",
  "org": "acme",
  "data": {
    "post": {
      "id": "clxxx...",
      "title": "Add keyboard shortcuts",
      "status": "open",
      "votes": 0,
      "author": { "email": "user@example.com", "name": null }
    }
  }
}
```

**Events and their payloads:**

| Event | `data` shape |
|-------|-------------|
| `post.created` | `{ post: { id, title, status, votes, author } }` |
| `post.status_changed` | `{ post: { id, title, oldStatus, newStatus } }` |
| `comment.created` | `{ comment: { id, body, authorEmail }, postId }` |
| `changelog.published` | `{ entry: { id, title, slug, label, publishedAt } }` |

**Retry schedule:** If your endpoint returns a non-2xx response, Freebase retries with delays:
- Attempt 1: immediate
- Attempt 2: 30 seconds
- Attempt 3: 5 minutes
- Attempt 4: 30 minutes
- Attempt 5: 2 hours

---

## 8. Docker Self-Host

Docker Compose bundles a Postgres database with the app, so you don't need Neon for self-hosting.

**Prerequisites:**

- Docker Desktop installed and running
- `.env` file at repo root with Supabase + Upstash + App vars (`DATABASE_URL` will be overridden by docker-compose.yml)

**Setup:**

```bash
# Build and start both services (postgres + web)
docker compose up -d

# Watch logs to confirm web service started
docker compose logs -f web
# Wait until you see: "Ready on http://0.0.0.0:3000"
```

**Run migrations inside the container:**

```bash
docker compose exec web sh -c \
  "DATABASE_URL=\$DATABASE_URL_UNPOOLED npx prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma"
```

**Optionally seed demo data + origin allowlist:**

```bash
docker compose exec web sh -c "pnpm --filter @freebase/db seed"
docker compose exec web sh -c "pnpm --filter @freebase/db set-origins"
```

**Verify:**

1. Visit `http://localhost:3000` → marketing page loads
2. Create an org → verify everything works same as local dev

**Stop and clean up:**

```bash
# Stop containers (keep data)
docker compose down

# Stop and delete database volume (full reset)
docker compose down -v
```

**Env vars for Docker:**

The `docker-compose.yml` automatically sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` to point to the bundled Postgres container. All other vars are read from your host environment or a repo-root `.env` file via `${VAR_NAME}` interpolation — this is the one place a repo-root env file is actually correct, because Docker reads `.env` at the repo root, not `apps/web/.env.local`.

Create that repo-root `.env` file for Docker from your working `apps/web/.env.local`:

```bash
# Docker reads .env at the repo root, NOT apps/web/.env.local
cp apps/web/.env.local .env
# Then docker compose up -d
```

---

## 9. Unit Tests

Unit tests live in `apps/web`. They use **vitest@2**. No external services needed — all dependencies are mocked via `vi.mock`.

### Run tests

```bash
# One-shot (CI)
pnpm --filter @freebase/web test

# Watch mode (dev)
pnpm --filter @freebase/web test:watch
```

### What's covered

| File | Tests |
|---|---|
| `settings/route.ts` DELETE | Supabase delete fires before Prisma delete; org survives auth failure (500 returned) |
| `settings/route.ts` PATCH | Invalid `accentColor` → 400 with structured `errors` array |
| `comments/route.ts` GET | `hasMore: true` when over limit; `hasMore: false` when under; limit capped at 100 |
| `comments/route.ts` POST | Missing body → 400 with `errors` array; invalid email → 400 with `authorEmail` field |
| `lib/cors.ts` | Origin allowlist matrix: no-Origin passthrough, empty-allowlist passthrough, exact match, mismatch rejection, case/trailing-slash normalization, app's-own-origin exemption |
| `posts/route.ts` (origin allowlist) | Mismatched `Origin` → 403; matching or absent `Origin` → normal success; same-origin call from the app's own origin succeeds even when the allowlist doesn't explicitly include it |

### Adding new tests

- Place test files in `__tests__/` subdirectory next to the route/hook file
- Mock `@/lib/prisma`, `@/lib/auth`, `@/lib/env` at minimum for API route tests
- Use `vi.mock` at top level (not inside test body) — vitest hoists these before imports
- `NextRequest` can be constructed directly: `new NextRequest("http://localhost/path", { method, body, headers })`
- Route handler params pattern: `{ params: Promise.resolve({ org: "slug" }) }`

---

## 10. Troubleshooting

### DATABASE_URL_UNPOOLED error during migration

```
Error: P3014 Prisma Migrate could not create the shadow database. Please make sure the database user has enough privileges.
```

Make sure you're using the direct (unpooled) URL:

```bash
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm db:migrate
```

---

### Prisma client out of sync

```
Error: Prisma Client is not yet initialized. Please call `prisma.$connect()` first.
```

Or you see TS errors about missing models. Regenerate:

```bash
pnpm db:generate
```

---

### Cal Sans font not loading (console warning)

```
Error: Could not find font file at path: apps/web/fonts/CalSans-SemiBold.woff2
```

Download and place the font:
```bash
# Download from: https://github.com/calcom/font/releases
# Place at:
apps/web/fonts/CalSans-SemiBold.woff2
```

---

### Tailwind CSS utility classes not applying (everything unstyled)

Tailwind v4 requires `@tailwindcss/postcss`. Verify `apps/web/postcss.config.mjs` exists with:

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

Then clear `.next/` and restart:

```bash
rm -rf apps/web/.next && pnpm dev
```

---

### Rate limiting not working in dev

If Upstash env vars are not set, rate limiting is silently skipped. This is intentional. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to enable it.

---

### Email subscribe button missing on public changelog

Expected behavior — `EMAIL_FROM_DOMAIN` env var must be set with a Resend-verified domain. Leave blank to disable the feature entirely. No error, just the button is hidden. (This is unrelated to admin Settings, which no longer has an Email Subscriptions section at all.)

---

### Webhook delivery not arriving at receiver

Check in order:
1. Webhook is **Active** (not Paused) in settings
2. The event type matches what you configured (e.g. `post.created` not `post.updated`)
3. Your receiver URL is publicly accessible (localhost URLs don't work for webhooks — use webhook.site or ngrok)
4. Receiver returns a 2xx status code — non-2xx triggers retries but doesn't indicate failure in Freebase UI

---

### Command palette not opening

- macOS: **⌘K** (Command + K)
- Windows/Linux: **Ctrl+K**
- Must be on an admin page (`/[org]/admin/...`) — palette is not available on public pages

---

### Supabase login fails immediately

Make sure **Email Confirmations** is turned OFF in Supabase → Authentication → Providers → Email. With it ON, you need to confirm your email before logging in (which breaks local dev flow).

---

### Docker web service fails to start

Check logs:
```bash
docker compose logs web
```

Common causes:
- Missing env vars (Supabase keys not in `.env`)
- Port 3000 already in use → `lsof -ti:3000 | xargs kill` then retry
- Docker not running → open Docker Desktop first

---

### Widget embeds unexpectedly blocked with a 403 after configuring Allowed Origins

Check that the calling page's exact origin (scheme + host + port, no path or trailing slash) is in the org's Allowed Origins list. Requests with no `Origin` header, and requests from the app's own `NEXT_PUBLIC_APP_URL`, are always allowed regardless of the list — only third-party embed origins need to be added.
