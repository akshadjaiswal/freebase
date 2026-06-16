import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { errors, ok } from "@/lib/api";

function isAllowedWebhookUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") return false;
    if (/^10\./.test(h) || /^192\.168\./.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|30|31)\./.test(h)) return false;
    if (h === "169.254.169.254" || h === "metadata.google.internal" || h === "metadata.azure.com") return false;
    return true;
  } catch { return false; }
}

const VALID_EVENTS = [
  "post.created",
  "post.updated",
  "post.status_changed",
  "post.deleted",
  "comment.created",
  "changelog.published",
] as const;

const createSchema = z.object({
  url: z.string().url("Must be a valid URL."),
  events: z.array(z.enum(VALID_EVENTS)).min(1, "Select at least one event."),
  secret: z.string().min(8, "Secret must be at least 8 characters."),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;
  const session = await verifyAdminAccess(orgSlug);
  if (!session) return errors.unauthorized();

  const webhooks = await prisma.webhook.findMany({
    where: { orgId: session.org.id },
    select: { id: true, url: true, events: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return ok({ data: webhooks });
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
  if (!parsed.success) {
    const field = parsed.error.errors[0];
    return errors.badRequest(field?.message ?? "Invalid input.");
  }

  if (!isAllowedWebhookUrl(parsed.data.url)) {
    return errors.badRequest("Webhook URL must be a public HTTPS endpoint.");
  }

  const secretHash = createHash("sha256").update(parsed.data.secret).digest("hex");

  const webhook = await prisma.webhook.create({
    data: {
      orgId: session.org.id,
      url: parsed.data.url,
      events: parsed.data.events,
      secret: secretHash,
    },
  });

  return ok(
    {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active,
      createdAt: webhook.createdAt,
    },
    201
  );
}
