# Freebase — Build Context

Freebase is an open-source product feedback platform (feedback board, changelog, roadmap, embeddable widget) — Next.js + Neon + Supabase, deployable to Vercel or self-hosted via Docker. This file holds facts true in every session. Feature-area detail lives in `.claude/rules/` (loads only when relevant files are touched); historical/what-changed narrative lives in git log, not here.

**Production URL:** https://freebase.vercel.app (main branch auto-deploys to Vercel)

All 7 phases (foundation, feedback, changelog, roadmap, widget, API/webhooks/settings, multi-org accounts) plus post-launch hardening (security, a11y, tests, marketing redesign, widget origin allowlist) are complete and shipped.

---

## Stack (locked — do not change without explicit approval)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| DB | Neon (Postgres) — pooled + unpooled |
| Auth | Supabase Auth only (NOT Supabase DB) |
| ORM | Prisma |
| Styling | Tailwind CSS v4 + custom shadcn/ui components |
| Rich text | Tiptap (admin only, text-only) |
| Email | Resend (env-gated via `EMAIL_FROM_DOMAIN`) |
| Widget | Vite + Vanilla TypeScript, <20KB gzip |
| Rate limit | Upstash Redis + `@upstash/ratelimit` |
| Monorepo | pnpm workspaces + Turborepo |
| Animations | motion |
| Icons | Lucide React |
| Theme | next-themes |
| Validation | Zod |
| Command palette | cmdk |
| Nav progress bar | nextjs-toploader |

---

## Routing (path-based — works on `vercel.app` with no DNS config)

```
/                              → marketing landing page
/new                           → create org (public, signed-out flow)
/login                         → admin login (public)
/[org]/feedback                → public feedback board
/[org]/changelog                → public changelog list + /[slug] detail
/[org]/roadmap                 → public roadmap
/[org]/admin                   → redirects to /[org]/admin/feedback
/[org]/admin/{feedback,changelog,roadmap,settings}  → admin (auth-gated)
/api/v1/orgs/[org]/...         → REST API (Bearer token or admin session)
/api/widget/[org]/{config,identify}  → widget backend (public)
/cdn/v1/sdk.js                  → static widget bundle
/docs                          → public docs page (no auth)
```

---

## Key files (only the ones that aren't obvious from the directory tree)

- `apps/web/lib/env.ts` — Zod env validation at module load; throws before any route runs if required vars are missing.
- `apps/web/lib/prisma.ts` — singleton client, imports `lib/env` at startup as a validation gate.
- `apps/web/lib/auth.ts` — `verifyAdminAccess()` (React.cache-wrapped), `verifyApiKey()`, `verifyAdminOrApiKey()` (session-first, API-key fallback — used by all write/admin routes).
- `apps/web/lib/data.ts` — `unstable_cache` wrappers for all page data, tagged for `revalidateTag` on mutation.
- `apps/web/lib/api.ts` / `lib/cors.ts` / `lib/jwt.ts` — see `.claude/rules/api-routes.md`.
- `apps/web/middleware.ts` — HTTPS/redirect concerns and org-slug fast-path redirects only; rate limiting and auth happen inline per-route-handler, not centrally here.
- `packages/db/prisma/schema.prisma` — see `.claude/rules/database.md`.

For widget internals, multi-org mechanics, API/webhook conventions, and DB commands — read the matching `.claude/rules/*.md` file; it loads automatically when you touch files in that area.

---

## Design tokens

Dark mode default (`defaultTheme="system"`, one root `ThemeProvider`). CSS custom properties on `:root`, `apps/web/app/globals.css`.

- Background `#0e0e10`, surface `#141416`, border `#2a2a2d`, text primary `#e2e2e5`, text secondary `#a1a1aa`, accent `#10b981` (emerald-500).
- Typography: 14px base (Inter), Cal Sans for headings/marketing.
- Border radius: sharp — 2px badges, 4px buttons/inputs, 6px cards, 8px modals.
- No drop shadows on dark mode (use borders) — except the embeddable widget, which deliberately uses floating shadows since it renders over arbitrary host-page backgrounds with no border context.

---

## Standing constraints (do not violate without explicit approval)

- **No email subscription UI** — the backend, API routes, and public changelog subscribe button still exist and work, but the admin Settings and marketing page UI were deliberately removed. Do not re-add without approval.
- **Never commit directly to `main`** — always create a branch first, even for trivial doc fixes.
- **`.env` files live in `apps/web/.env.local`, not the repo root** — Next.js only reads env from the app directory. (Exception: Docker reads a repo-root `.env`, since `docker-compose.yml` runs from there.)
- **Prisma: import from `@prisma/client`, never `.prisma/client`** — see `.claude/rules/database.md`.
- Tailwind v4 requires the `@tailwindcss/postcss` plugin (`apps/web/postcss.config.mjs`) — it does not auto-integrate with Next.js/Turbopack. Without it, `@import "tailwindcss"` only processes custom CSS; zero utility classes generate.

---

## Local dev setup

```bash
pnpm install
cp .env.example apps/web/.env.local
# Fill in: DATABASE_URL, DATABASE_URL_UNPOOLED, NEXT_PUBLIC_SUPABASE_URL,
#          NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, NEXT_PUBLIC_APP_URL
DATABASE_URL=$DATABASE_URL_UNPOOLED pnpm db:migrate
pnpm db:generate
pnpm dev
```

App runs at `http://localhost:3000`. See `.claude/rules/database.md` for seed/migration commands, `SETUP.md` for the full manual test checklist.

---

## Research docs

`research/LOCAL_SETUP_AND_TESTING.md` is tracked and pushed — full local setup + manual test guide, available to anyone who clones the repo.

The rest of `/research/` is **gitignored, local-only, exists only on this machine** — won't be present for anyone else who clones the repo: `PLAN.md` (spec, schema, phases), `FRONTEND_DESIGN.md` (tokens, components, page specs), `API_SPEC.md` (endpoints, rate limits, webhooks), `INTEGRATION.md` (deploy model, JWT flow, framework examples). Locked product/design/API decisions live there — read before building any new feature; don't deviate from locked decisions without explicit approval.
