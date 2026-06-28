import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errors } from "@/lib/api";
import { verifyAdminOrApiKey } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;

  const admin = await verifyAdminOrApiKey(request, orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  const category = await prisma.category.findFirst({
    where: { id, orgId: admin.orgId },
  });
  if (!category) return errors.notFound("Category not found.");

  await prisma.category.delete({ where: { id } });

  revalidateTag(`feedback-${admin.orgId}`);

  return new Response(null, { status: 204 });
}
