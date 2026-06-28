import { NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminOrApiKey } from "@/lib/auth";
import { errors, ok } from "@/lib/api";
import { dispatchWebhook } from "@/lib/webhooks";
import { logger } from "@/lib/logger";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type RouteParams = { params: Promise<{ org: string; slug: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { org: orgSlug, slug } = await params;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return errors.notFound("Organization not found.");

  const post = await prisma.changelogPost.findUnique({
    where: { orgId_slug: { orgId: org.id, slug } },
  });
  if (!post) return errors.notFound("Changelog post not found.");

  return ok(post);
}

const tiptapNodeSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.unknown()).optional(),
    content: z.array(tiptapNodeSchema).optional(),
    marks: z.array(z.object({ type: z.string(), attrs: z.record(z.unknown()).optional() })).optional(),
    text: z.string().optional(),
  })
);

const updateSchema = z.object({
  title: z.string().min(1).max(200).transform((s) => s.trim()).optional(),
  body: z.object({
    type: z.literal("doc"),
    content: z.array(tiptapNodeSchema).optional(),
  }).optional(),
  label: z.enum(["feature", "improvement", "bug-fix", "announcement"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
  slug: z.string().max(120).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { org: orgSlug, slug } = await params;

  const admin = await verifyAdminOrApiKey(req, orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  const post = await prisma.changelogPost.findUnique({
    where: { orgId_slug: { orgId: admin.orgId, slug } },
  });
  if (!post) return errors.notFound("Changelog post not found.");

  const body = await req.json().catch(() => null);
  if (!body) return errors.badRequest("Invalid JSON body.");

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest("Validation failed.", parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })));
  }

  const { status, publishedAt, body: richBody, ...rest } = parsed.data;

  const isPublishing = status === "published" && post.status === "draft";

  const updated = await prisma.changelogPost.update({
    where: { id: post.id },
    data: {
      ...rest,
      ...(richBody !== undefined ? { body: richBody as unknown as import("@prisma/client").Prisma.InputJsonValue } : {}),
      ...(status !== undefined ? { status } : {}),
      publishedAt:
        publishedAt !== undefined
          ? publishedAt
            ? new Date(publishedAt)
            : null
          : status === "published" && !post.publishedAt
          ? new Date()
          : undefined,
    },
  });

  // Send email to confirmed subscribers when publishing (fire-and-forget)
  if (isPublishing && process.env.EMAIL_FROM_DOMAIN && process.env.RESEND_API_KEY) {
    const finalTitle = updated.title;
    const finalSlug = updated.slug;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://freebase.app";
    const postUrl = `${appUrl}/${orgSlug}/changelog/${finalSlug}`;

    prisma.organization
      .findUnique({ where: { id: admin.orgId }, select: { name: true } })
      .then(async (org) => {
        const orgName = org?.name ?? orgSlug;
        const subscribers = await prisma.changelogSubscriber.findMany({
          where: { orgId: admin.orgId, confirmed: true },
        });
        if (subscribers.length === 0) return;
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await Promise.allSettled(
          subscribers.map((sub) =>
            resend.emails.send({
              from: `${orgName} <noreply@${process.env.EMAIL_FROM_DOMAIN}>`,
              to: sub.email,
              subject: `New update: ${finalTitle}`,
              html: `<p>A new update was published by <strong>${escapeHtml(orgName)}</strong>.</p><h2>${escapeHtml(finalTitle)}</h2><p><a href="${postUrl}">Read the full update →</a></p>`,
            })
          )
        );
      })
      .catch((e) => logger.error("Failed to send subscriber emails", { orgSlug, error: e instanceof Error ? e.message : String(e) }));
  }

  revalidateTag(`changelog-${admin.orgId}`);

  if (isPublishing) {
    dispatchWebhook(admin.orgId, {
      event: "changelog.published",
      org: orgSlug,
      data: { post: { id: updated.id, title: updated.title, slug: updated.slug } },
    });
  }

  return ok(updated);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { org: orgSlug, slug } = await params;

  const admin = await verifyAdminOrApiKey(req, orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  const post = await prisma.changelogPost.findUnique({
    where: { orgId_slug: { orgId: admin.orgId, slug } },
  });
  if (!post) return errors.notFound("Changelog post not found.");

  await prisma.changelogPost.delete({ where: { id: post.id } });

  revalidateTag(`changelog-${admin.orgId}`);

  return new Response(null, { status: 204 });
}
