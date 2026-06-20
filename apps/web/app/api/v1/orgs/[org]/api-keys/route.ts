import { NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { errors, ok } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(1).max(80),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  const keys = await prisma.apiKey.findMany({
    where: { orgId: session.org.id },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return ok({ data: keys });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest("Name is required (max 80 chars).");

  const rawKey = `fb_live_${randomBytes(32).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: {
      orgId: session.org.id,
      name: parsed.data.name,
      keyHash,
      keyPrefix,
    },
  });

  revalidateTag(`settings-${session.org.id}`);

  return ok(
    {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      key: rawKey,
      createdAt: apiKey.createdAt,
    },
    201
  );
}
