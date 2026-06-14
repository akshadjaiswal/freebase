# Freebase

> Open source alternative to [Featurebase](https://featurebase.app) — MIT licensed, deployable to Vercel free tier or self-hosted with Docker.

Collect feedback, publish changelogs, and showcase your roadmap. Drop one `<script>` tag to embed all three surfaces in your app.

---

## Features

| Feature | Description |
|---|---|
| **Feedback board** | Public voting board. Users submit ideas, upvote, comment. Admin manages statuses, categories, pin posts. |
| **Changelog** | Rich text editor (Tiptap), draft/publish flow, email subscriptions (Resend), RSS feed. |
| **Roadmap** | Three-column kanban: Planned → In Progress → Done. Admin drag-reorders, public read-only. |
| **Embeddable widget** | Single `<script>` tag. Feedback form, changelog popup with unread badge, roadmap panel. <20KB gzip. |
| **REST API** | Full REST API with API key auth. Use it to integrate with your own tools. |
| **Webhooks** | HMAC-signed outbound webhooks for `post.created`, `post.status_changed`, `comment.created`, `changelog.published`. |
| **Command palette** | `⌘K` from anywhere in the admin to jump between sections. |

---

## Status

All 6 phases complete — v1 ready.

| Phase | Status |
|---|---|
| Monorepo scaffold, auth, admin shell | ✅ done |
| Feedback board (public + admin + API) | ✅ done |
| Changelog (Tiptap, RSS, email subscriptions) | ✅ done |
| Roadmap (kanban, drag-reorder, public view) | ✅ done |
| Embeddable widget (Vite bundle, JWT identify) | ✅ done |
| API keys, webhooks, settings, Docker | ✅ done |

---

## Quick start (Vercel deploy)

1. Fork this repo
2. Create accounts on [Neon](https://neon.tech), [Supabase](https://supabase.com), [Upstash](https://upstash.com)
3. Set environment variables (see [SETUP.md](SETUP.md))
4. Deploy to Vercel — one click

See [SETUP.md](SETUP.md) for the full step-by-step guide.

---

## Self-host with Docker

```bash
git clone https://github.com/akshadjaiswal/freebase
cd freebase
cp .env.example .env
# Edit .env with your values (Supabase URL + keys, Resend, Upstash)
docker compose up -d
```

App runs at `http://localhost:3000`. Postgres is included in the compose setup.

See [Self-host with Docker](#self-host-with-docker-1) below for full details.

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
<script src="https://your-freebase-instance.com/cdn/v1/sdk.js" async></script>
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
  { userId, email, name, orgId: 'your-org-slug' },
  process.env.FREEBASE_WIDGET_SECRET,
  { expiresIn: '1h' }
);
```

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

Full API reference in [research/API_SPEC.md](research/API_SPEC.md) (gitignored — see repo root).

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
const { createHmac, timingSafeEqual } = require('crypto');

function verify(rawBody, timestamp, signature, secret) {
  const expected = 'sha256=' + createHmac('sha256', secret)
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
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis REST token |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of your deployment |
| `FREEBASE_API_SECRET` | ✅ | 32-byte hex secret for internal signing |
| `RESEND_API_KEY` | Optional | Enables changelog email subscriptions |
| `EMAIL_FROM_DOMAIN` | Optional | Verified Resend domain for sending emails |
| `NEXT_PUBLIC_WIDGET_DEMO_ORG` | Optional | Org slug to show live widget on marketing page |

---

## Self-host with Docker

`docker-compose.yml` provides a single-command setup with a local Postgres database.

```bash
cp .env.example .env
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, FREEBASE_API_SECRET
# DATABASE_URL and DATABASE_URL_UNPOOLED are set automatically by docker-compose

docker compose up -d

# Run migrations (first time only)
docker compose exec web sh -c "DATABASE_URL=\$DATABASE_URL_UNPOOLED npx prisma migrate deploy"
```

App runs at `http://localhost:3000`.

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
| Monorepo | pnpm workspaces |

---

## Contributing

Issues and PRs welcome. For significant changes, open a discussion first.

---

## License

MIT
