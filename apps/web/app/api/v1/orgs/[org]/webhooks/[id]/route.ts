import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { errors, ok } from "@/lib/api";

const updateSchema = z.object({
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  const webhook = await prisma.webhook.findUnique({ where: { id } });
  if (!webhook || webhook.orgId !== session.org.id) return errors.notFound("Webhook not found.");

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest("Invalid input.");

  const updated = await prisma.webhook.update({
    where: { id },
    data: parsed.data,
    select: { id: true, url: true, events: true, active: true, createdAt: true },
  });

  return ok(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  const webhook = await prisma.webhook.findUnique({ where: { id } });
  if (!webhook || webhook.orgId !== session.org.id) return errors.notFound("Webhook not found.");

  await prisma.webhook.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
