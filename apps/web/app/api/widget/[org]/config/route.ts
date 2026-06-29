import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Freebase-User",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/widget/[org]/config — public, no auth
// Returns org name, accentColor, categories for widget initialisation
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: {
      name: true,
      slug: true,
      accentColor: true,
      categories: { select: { id: true, name: true } },
    },
  });

  if (!org) return errors.notFound("Organization not found");

  return ok(
    {
      name: org.name,
      slug: org.slug,
      accentColor: org.accentColor,
      categories: org.categories,
    },
    200,
    corsHeaders
  );
}
