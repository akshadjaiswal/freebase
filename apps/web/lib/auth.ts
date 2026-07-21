import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

// Per-request memoized: layout + page both call this, only one DB hit per render
export const verifyAdminAccess = cache(async function verifyAdminAccess(orgSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const membership = await prisma.orgMember.findFirst({
    where: { userId: user.id, org: { slug: orgSlug } },
    include: { org: true, user: true },
  });

  if (!membership) return null;

  return { user, dbUser: membership.user, org: membership.org, role: membership.role };
});

// All orgs the given Supabase Auth user belongs to — used by the login picker and org switcher
export const getUserMemberships = cache(async function getUserMemberships(userId: string) {
  return prisma.orgMember.findMany({
    where: { userId },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  });
});

// Accepts admin session OR API key Bearer token — for all admin API routes.
// Returns { orgId, orgSlug } on success, null on failure.
export async function verifyAdminOrApiKey(
  request: { headers: { get(name: string): string | null } },
  orgSlug: string
): Promise<{ orgId: string } | null> {
  // Try session first (browser / SSR)
  const session = await verifyAdminAccess(orgSlug).catch(() => null);
  if (session) return { orgId: session.org.id };

  // Fall back to API key
  const apiKey = await verifyApiKey(request.headers.get("authorization"), orgSlug).catch(() => null);
  if (apiKey) return { orgId: apiKey.orgId };

  return null;
}

// Verify API key Bearer token — returns org if valid, null otherwise
export async function verifyApiKey(
  authHeader: string | null,
  orgSlug: string
): Promise<{ orgId: string; keyId: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const rawKey = authHeader.slice(7);
  if (!rawKey.startsWith("fb_live_") && !rawKey.startsWith("fb_test_")) return null;

  const keyHash = createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { org: { select: { slug: true } } },
  });

  if (!apiKey || apiKey.org.slug !== orgSlug) return null;

  // Update last used timestamp asynchronously — don't block response
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return { orgId: apiKey.orgId, keyId: apiKey.id };
}
