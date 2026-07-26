---
paths:
  - "apps/web/lib/auth.ts"
  - "apps/web/app/(auth)/**/*"
  - "apps/web/components/layout/sidebar.tsx"
  - "apps/web/components/layout/create-org-dialog.tsx"
  - "apps/web/middleware.ts"
  - "apps/web/app/api/auth/**/*"
---

# Multi-org accounts

One Supabase Auth user can belong to up to 5 organizations via the `OrgMember` join table (`userId`, `orgId`, `role`, `@@unique([userId, orgId])`). `User` itself carries no org — org membership always resolves per-request against the URL's `orgSlug`, never cached globally.

## Access resolution

- `verifyAdminAccess(orgSlug)` in `lib/auth.ts` — wrapped in `React.cache()` (one DB hit per render). Resolves via `prisma.orgMember.findFirst({ where: { userId, org: { slug: orgSlug } } })`, returns `{ user, dbUser, org, role }`.
- `getUserMemberships(userId)` in `lib/auth.ts` — all orgs a user belongs to; used by the login picker and sidebar switcher.
- API keys are unaffected by multi-org — always org-scoped, never account-scoped.

## 5-org cap

Enforced **server-side** in `apps/web/app/api/auth/create-org/route.ts` via `prisma.orgMember.count(...)`, returns 400 past the limit. Never trust the client-disabled UI state alone — the sidebar's "+ New organization" button being disabled is a UX nicety, not the enforcement.

The route branches on whether a Supabase session already exists: signed-out → full signup flow (Supabase user + Organization + User + OrgMember together); already signed-in → skips Supabase user creation, just adds a new Organization + OrgMember.

## Login redirect — last-active-org auto-redirect, picker as fallback only

Logged-in users visiting `/login`, `/`, or `/new` land on `/{org}/admin/feedback` directly (not `/{org}/admin` — that extra redirect hop roughly doubled perceived latency, removed everywhere) via two mechanisms:

1. **Middleware fast path** — checks `user?.user_metadata?.orgSlug`. Redirect hint only, **never load-bearing for authz** (`user_metadata` is client-writable; actual authorization always re-verifies against the DB in `verifyAdminAccess`).
2. **Client-side fallback** — login page calls `/api/auth/me` (`{ orgs, lastOrgSlug }`), `pickLandingOrg()` prefers `lastOrgSlug` if still valid → falls back to single-org case → falls back to the "Choose an organization" picker only when there's no valid remembered org.

`user_metadata.orgSlug` is kept fresh via a shared `rememberOrg(slug)` helper (fire-and-forget `supabase.auth.updateUser({ data: { orgSlug } })`) called on every signup, org switch, and new-org creation — not just at initial signup.

## Sidebar switcher

Org header is a `DropdownMenu`: lists all memberships (checkmark on active org), "+ New organization" (disabled + tooltip at the cap) opens `CreateOrgDialog`. Switching is a full page navigation preserving the current subpath (switch while on Settings → lands back on Settings). No client-side data merging — each org's data stays isolated per-request via existing `orgId` scoping.

**Stale-data gotcha**: client components that captured server props into `useState(initialProp)` do NOT resync on an `[org]` param change alone — Next.js re-renders in place rather than remounting. Fix: pass `key={orgSlug}` to force a clean remount on every org switch (already applied to `SettingsClient`, `AdminFeedbackClient`, `AdminRoadmapClient`).
