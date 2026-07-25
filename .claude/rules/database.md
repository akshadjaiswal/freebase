---
paths:
  - "packages/db/**/*"
  - "apps/web/lib/prisma.ts"
---

# Database (packages/db)

Neon Postgres. `DATABASE_URL` (pooled, via PgBouncer) used by Prisma at runtime; `DATABASE_URL_UNPOOLED` (direct) used only for migrations.

## Commands

```bash
# Migrate
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm --filter db prisma migrate dev --name <description>

# Regenerate client after any schema change
pnpm db:generate

# Push schema without migration (dev only)
pnpm db:push

# Seed demo data for "freebase" org (idempotent, but DESTRUCTIVE — wipes and
# reseeds that org's feedback/changelog/roadmap data every run)
pnpm --filter @freebase/db seed

# Seed allowedOrigins for the demo org (non-destructive, safe to re-run anytime,
# only touches that one field — kept deliberately separate from seed.ts)
pnpm --filter @freebase/db set-origins
```

## Prisma client (pnpm monorepo gotcha)

Schema sets `output = "../../../node_modules/.prisma/client"` so Turbopack can find the generated client. Generated client lands at repo root `node_modules/.prisma/client/`.

**Always import from `@prisma/client`, never `.prisma/client` directly** — the latter is an internal generated path that fails on Vercel. `@prisma/client` re-exports everything and is the correct public API.

## Schema notes

- `Organization.allowedOrigins` — `String[] @default([])`, widget origin allowlist.
- `User` has no org reference — org membership lives entirely in `OrgMember` (see `.claude/rules/multi-org.md`).
- `FeedbackPost.voteCount` — denormalized counter, incremented/decremented on vote, avoids a COUNT() join on every list render.
- `Webhook.secret` — stored as a SHA-256 hash, never plaintext.
- `ApiKey.keyPrefix` — first ~12 chars, display-only so an admin can recognize a key without re-revealing it.
