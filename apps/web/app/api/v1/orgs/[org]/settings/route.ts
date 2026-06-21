import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { errors, ok } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color.").optional(),
  regenerateSecret: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  return ok({
    id: session.org.id,
    name: session.org.name,
    slug: session.org.slug,
    accentColor: session.org.accentColor,
    secretKey: session.org.secretKey,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const field = parsed.error.errors[0];
    return errors.badRequest(field?.message ?? "Invalid input.");
  }

  const updateData: { name?: string; accentColor?: string; secretKey?: string } = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.accentColor !== undefined) updateData.accentColor = parsed.data.accentColor;
  if (parsed.data.regenerateSecret) {
    updateData.secretKey = randomBytes(32).toString("hex");
  }

  const updated = await prisma.organization.update({
    where: { id: session.org.id },
    data: updateData,
    select: { id: true, name: true, slug: true, accentColor: true, secretKey: true },
  });

  revalidateTag(`org-${session.org.id}`);
  revalidateTag(`org-slug-${session.org.slug}`);

  return ok(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  // Delete org (cascades to all related records via Prisma onDelete: Cascade)
  await prisma.organization.delete({ where: { id: session.org.id } });

  // Delete Supabase auth user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { createClient: createAdmin } = await import("@supabase/supabase-js");
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await admin.auth.admin.deleteUser(user.id).catch(() => {});
  }

  return new Response(null, { status: 204 });
}
