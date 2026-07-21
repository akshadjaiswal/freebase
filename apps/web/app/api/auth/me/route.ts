import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id },
    include: { org: { select: { slug: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  return NextResponse.json({
    orgs: memberships.map((m) => ({ slug: m.org.slug, name: m.org.name })),
    lastOrgSlug: (user.user_metadata?.orgSlug as string | undefined) ?? null,
  });
}
