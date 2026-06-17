import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { org: { select: { slug: true } } },
  });

  if (!dbUser?.org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  return NextResponse.json({ orgSlug: dbUser.org.slug });
}
