import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";

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

  return ok({
    name: org.name,
    slug: org.slug,
    accentColor: org.accentColor,
    categories: org.categories,
  });
}
