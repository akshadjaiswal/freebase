import { NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { verifyAdminAccess } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  const categories = await prisma.category.findMany({
    where: { orgId: org.id },
    orderBy: { name: "asc" },
  });

  return ok({ data: categories.map((c: (typeof categories)[0]) => ({ id: c.id, name: c.name, color: c.color })) });
}

const createCategorySchema = z.object({
  name: z.string().min(1, "Name required.").max(50, "Name max 50 characters."),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color.")
    .optional()
    .default("#6366f1"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  const admin = await verifyAdminAccess(orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Invalid JSON body.");
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest("Validation failed.", parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })));
  }

  const existing = await prisma.category.findFirst({
    where: { orgId: admin.org.id, name: { equals: parsed.data.name, mode: "insensitive" } },
  });
  if (existing) return errors.conflict("A category with this name already exists.");

  const category = await prisma.category.create({
    data: {
      orgId: admin.org.id,
      name: parsed.data.name,
      color: parsed.data.color,
    },
  });

  revalidateTag(`feedback-${admin.org.id}`);

  return ok({ id: category.id, name: category.name, color: category.color }, 201);
}
