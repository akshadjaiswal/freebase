---
paths:
  - "apps/web/app/api/**/*"
---

# API routes (apps/web/app/api)

Base: `/api/v1/orgs/[org]/...`, Bearer token or admin session auth (`verifyAdminOrApiKey(request, orgSlug)` in `lib/auth.ts` — session-first, API-key fallback; wired to all write/admin routes).

## Error format — RFC 9457 Problem Details

All errors: `application/problem+json`, via `errors.*` helpers in `lib/api.ts` (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `unprocessable`, `rateLimited`, `internal`). Validation errors return a `{ field, message }[]` array. `type` URL is built from `NEXT_PUBLIC_APP_URL`, not hardcoded.

## Pagination

Cursor-based via `encodeCursor`/`decodeCursor` in `lib/api.ts` — base64url of `{ id, createdAt }`. Default limit 20, max 100. `posts` rejects `limit > 100` with 400; `changelog`/`comments` silently clamp instead — inconsistent, be aware if touching either.

## Origin allowlist (widget-facing routes only)

`posts`, `posts/[id]/vote`, `posts/[id]/comments`, `changelog` GET, `roadmap` GET, and both `api/widget/[org]/*` routes call `checkOriginAllowed()` from `lib/cors.ts` after the org lookup. Empty `Organization.allowedOrigins` = unrestricted (default, matches pre-existing behavior). The app's own origin (`NEXT_PUBLIC_APP_URL`) is always exempt regardless of the allowlist — required because browsers send `Origin` on same-origin POST/DELETE fetches too, not just cross-origin ones. Rejection is 403 with **no CORS headers** so the browser blocks even the error body from being read.

## Voting dedup (priority order, check in this sequence)

1. JWT identified — `userId` from `X-Freebase-User` header (verified HMAC JWT, never request body) → `user_id + post_id` unique.
2. Email known — from request body → `voterEmail + post_id` unique.
3. Anonymous — `SHA256(IP + User-Agent + orgId)` → `voterFingerprint + post_id` unique.

At least one of the three is always set.

## Webhooks

`lib/webhooks.ts` — `dispatchWebhook(orgId, payload)` fire-and-forget. HMAC key is `SHA256(secret)`, **not the raw secret** — the server only ever stores the hash. Retry schedule: immediate → 30s → 5min → 30min → 2hr (5 total attempts). Events wired: `post.created`, `post.status_changed`, `comment.created`, `changelog.published`. URLs validated against SSRF (`isAllowedWebhookUrl` in `webhooks/route.ts` — rejects non-HTTPS, localhost, private IP ranges, cloud-metadata hosts).

## Settings page section order (as rendered)

Organization → Allowed Origins → Widget Secret Key → API Keys → Webhooks → Danger Zone. No Email Subscriptions section (removed from admin UI — see the root CLAUDE.md constraint).
