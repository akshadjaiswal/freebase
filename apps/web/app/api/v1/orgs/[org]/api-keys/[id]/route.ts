import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { errors } from "@/lib/api";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  const apiKey = await prisma.apiKey.findUnique({ where: { id } });
  if (!apiKey || apiKey.orgId !== session.org.id) return errors.notFound("API key not found.");

  await prisma.apiKey.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
