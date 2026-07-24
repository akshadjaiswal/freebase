# Freebase

> Open source alternative to [Featurebase](https://featurebase.app) : feedback boards, changelog, roadmap & embeddable widget.

Collect feedback, publish changelogs, and showcase your roadmap. Drop one `<script>` tag to embed all three surfaces in your app.

---

## Features

| Feature | Description |
|---|---|
| **Feedback board** | Public voting board. Users submit ideas, upvote, comment. Admin manages statuses, categories, pin posts. |
| **Changelog** | Rich text editor (Tiptap), draft/publish flow, RSS feed. |
| **Roadmap** | Three-column kanban: Planned → In Progress → Done. Admin drag-reorders, public read-only. |
| **Embeddable widget** | Single `<script>` tag. A collapsed launcher button fans out to feedback, changelog (with unread badge), and roadmap panels. <20KB gzip. |
| **REST API** | Full REST API with API key auth. Use it to integrate with your own tools. |
| **Webhooks** | HMAC-signed outbound webhooks for `post.created`, `post.status_changed`, `comment.created`, `changelog.published`. |
| **Command palette** | `⌘K` from anywhere in the admin to jump between sections. |
| **Multi-org accounts** | One login, up to 5 organizations. Switch instantly from the sidebar — each org has fully isolated data and its own widget secret key. |
| **Origin allowlist** | Restrict which domains can embed your widget via Settings → Allowed Origins. Unrestricted by default — your own pages are never affected either way. |

---

## Quick start (deploy your own)

1. Fork this repo
2. Create accounts on [Neon](https://neon.tech), [Supabase](https://supabase.com), [Upstash](https://upstash.com)
3. Set environment variables (see [SETUP.md](SETUP.md))
4. Deploy to Vercel — one click

See [SETUP.md](SETUP.md) for the full step-by-step guide, or [Self-host with Docker](#self-host-with-docker) below to run everything locally with a bundled Postgres instead of Neon.

---

## Embeddable widget

Drop this in any HTML page:

```html
<script>
  window.Freebase = window.Freebase || function(...a) {
    (window.Freebase.q = window.Freebase.q || []).push(a);
  };
  window.Freebase('init', { org: 'your-org-slug' });
</script>
<script src="https://your-app-url.com/cdn/v1/sdk.js" async></script>
```

Identify logged-in users (optional):

```js
window.Freebase('identify', {
  userId: 'user_123',
  email: 'user@example.com',
  name: 'Jane Doe',
  jwt: '<server-signed-jwt>',
});
```

The JWT is signed server-side with your org's secret key (visible in Settings → Widget Secret Key):

```js
// Node.js — any jwt library works
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId, email, name, orgSlug: 'your-org-slug' },  // orgSlug must match your org's URL slug
  process.env.FREEBASE_WIDGET_SECRET,
  { expiresIn: '1h' }
);
```

---

## Multi-org accounts

One login can own and switch between up to 5 organizations — each with its own feedback board, changelog, roadmap, and widget secret key, fully isolated from the others.

- **Switch instantly** from the org name dropdown at the top of the sidebar — no re-login, no page reload of the surrounding shell.
- **Add another org** via "+ New organization" in the same dropdown (disabled once you hit the 5-org limit).
- **Auto-lands on your last-active org** on login — the picker only shows up if there's no remembered org yet (first login, or you were removed from the last one).

---

## Widget origin allowlist

By default, any website can embed your widget just by knowing your org's (public, non-secret) slug. Settings → Allowed Origins lets you restrict embedding to specific domains you trust.

- **Unrestricted by default** — an empty list means any site can embed the widget, same as before this setting existed.
- **Your own pages are never affected** — the org's own public feedback/changelog/roadmap pages keep working regardless of what's configured, even after you add a restriction.
- **Enforced server-side** — a mismatched `Origin` header gets a 403 with no CORS headers, so a blocked site's browser can't even read the response.

---

## REST API

All endpoints require an API key created in Settings → API Keys.

```
Authorization: Bearer fb_live_<your-key>
```

```bash
# List feedback posts
curl -H "Authorization: Bearer fb_live_xxx" \
  https://your-instance.com/api/v1/orgs/your-org/posts

# Create a post
curl -X POST -H "Authorization: Bearer fb_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"title":"Dark mode support","authorEmail":"user@example.com"}' \
  https://your-instance.com/api/v1/orgs/your-org/posts
```

Full API reference: see `/docs` in your deployed instance or `research/API_SPEC.md` locally.

---

## Webhooks

Create webhooks in Settings → Webhooks. Each delivery includes HMAC-SHA256 signature headers:

```
X-Freebase-Signature: sha256=<hmac>
X-Freebase-Timestamp: <unix-timestamp>
X-Freebase-Event: post.status_changed
```

Verify in your receiver:

```js
const { createHash, createHmac, timingSafeEqual } = require('crypto');

function verify(rawBody, timestamp, signature, secret) {
  // Freebase stores secrets hashed — HMAC key is SHA-256(secret)
  const key = createHash('sha256').update(secret).digest('hex');
  const expected = 'sha256=' + createHmac('sha256', key)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon pooled connection string |
| `DATABASE_URL_UNPOOLED` | ✅ | Neon direct connection (migrations only) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server only) |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST URL (enables rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis REST token (enables rate limiting) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of your deployment |
| `RESEND_API_KEY` | Optional | Resend API key (reserved for future email features) |
| `EMAIL_FROM_DOMAIN` | Optional | Verified Resend domain |
| `NEXT_PUBLIC_WIDGET_DEMO_ORG` | Optional | Org slug to show a live widget across the whole app (mounted in the root layout — every route, including admin) |

---

## Self-host with Docker

`docker-compose.yml` provides a single-command setup with a local Postgres database.

```bash
cp .env.example .env
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          NEXT_PUBLIC_APP_URL (your public domain)
# Optional: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (rate limiting)
# DATABASE_URL and DATABASE_URL_UNPOOLED are set automatically by docker-compose

docker compose up -d

# Run migrations (first time only)
docker compose exec web sh -c "DATABASE_URL=\$DATABASE_URL_UNPOOLED npx prisma migrate deploy"
```

App runs at `http://localhost:3000`.

Optionally seed demo data for a `freebase` org — `pnpm --filter @freebase/db seed` (idempotent) — and its widget origin allowlist for local testing — `pnpm --filter @freebase/db set-origins` (non-destructive, safe to re-run anytime).

To use an external database (e.g. Neon) instead of the bundled Postgres, remove the `postgres` service from `docker-compose.yml` and set your own `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router + Turbopack |
| Database | Neon (Postgres) — Prisma ORM |
| Auth | Supabase Auth (email + password) |
| Styling | Tailwind CSS v4 + custom shadcn/ui |
| Rich text | Tiptap (admin only) |
| Email | Resend (env-gated) |
| Widget | Vite + Vanilla TypeScript, <20KB gzip |
| Rate limit | Upstash Redis + @upstash/ratelimit |
| Monorepo | pnpm workspaces + Turborepo |
| Animations | motion |
| Icons | Lucide React |
| Theme | next-themes |
| Validation | Zod |
| Command palette | cmdk |
| Nav progress bar | nextjs-toploader |

---

## Contributing

Issues and PRs welcome. For significant changes, open a discussion first.

See [SETUP.md](SETUP.md) for local dev setup.

---

## License

MIT
