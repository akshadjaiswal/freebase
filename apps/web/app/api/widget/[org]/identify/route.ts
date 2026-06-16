import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { verifyWidgetJwt } from "@/lib/jwt";
import { getWidgetIdentifyLimiter, getClientIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  jwt: z.string().min(1),
});

// POST /api/widget/[org]/identify — verify host-signed JWT, return session token
// Rate limited: 60/min per IP
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  // Rate limiting
  const limiter = getWidgetIdentifyLimiter();
  if (limiter) {
    const ip = getClientIp(request);
    const result = await limiter.limit(ip);
    if (!result.success) {
      return errors.rateLimited(
        Math.ceil((result.reset - Date.now()) / 1000)
      );
    }
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, secretKey: true },
  });
  if (!org) return errors.notFound("Organization not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Invalid JSON");
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest("jwt is required");
  }

  const payload = await verifyWidgetJwt(parsed.data.jwt, org.secretKey);
  if (!payload) {
    return errors.unauthorized("Invalid or expired JWT");
  }

  // Validate orgSlug claim matches the route param
  if (payload.orgSlug !== orgSlug) {
    return errors.forbidden("JWT orgSlug does not match");
  }

  // Return the verified identity — widget stores this and attaches to requests
  // In v1 we simply echo back the verified JWT itself as the session token
  return ok({
    token: parsed.data.jwt,
    userId: payload.userId,
    email: payload.email,
    name: payload.name ?? null,
  });
}
