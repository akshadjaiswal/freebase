import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { corsHeaders, checkOriginAllowed } from "@/lib/cors";

const CORS_METHODS = "GET, OPTIONS";

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 204, headers: corsHeaders(request, CORS_METHODS) });
}

// GET /api/widget/[org]/config — public, no auth
// Returns org name, accentColor, categories for widget initialisation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: {
      name: true,
      slug: true,
      accentColor: true,
      allowedOrigins: true,
      categories: { select: { id: true, name: true } },
    },
  });

  if (!org) return errors.notFound("Organization not found");

  const originCheck = checkOriginAllowed(request, org.allowedOrigins);
  if (!originCheck.allowed) return errors.forbidden("This origin is not authorized to access this organization's widget.");

  return ok(
    {
      name: org.name,
      slug: org.slug,
      accentColor: org.accentColor,
      categories: org.categories,
    },
    200,
    corsHeaders(request, CORS_METHODS)
  );
}
