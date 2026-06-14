import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { verifyAdminAccess } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  const post = await prisma.feedbackPost.findFirst({
    where: { id, orgId: org.id },
    include: {
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) return errors.notFound("Post not found.");

  return ok({
    id: post.id,
    title: post.title,
    description: post.description,
    status: post.status,
    votes: post.voteCount,
    commentCount: post._count.comments,
    category: post.category,
    author: { email: post.authorEmail, name: post.authorName },
    pinned: post.pinned,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  });
}

const VALID_STATUSES = ["open", "planned", "in-progress", "done", "closed"] as const;

const patchPostSchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  pinned: z.boolean().optional(),
  categoryId: z.string().cuid().nullable().optional(),
  title: z.string().min(5).max(150).optional(),
  description: z.string().max(2000).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;

  const admin = await verifyAdminAccess(orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  const post = await prisma.feedbackPost.findFirst({
    where: { id, orgId: admin.org.id },
  });
  if (!post) return errors.notFound("Post not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Invalid JSON body.");
  }

  const parsed = patchPostSchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest("Validation failed.", parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })));
  }

  const previousStatus = post.status;
  const updated = await prisma.feedbackPost.update({
    where: { id },
    data: parsed.data,
    include: {
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  // Sync linked roadmap item status when post status changes
  if (parsed.data.status && parsed.data.status !== previousStatus) {
    const statusMap: Record<string, string> = {
      planned: "planned",
      "in-progress": "in-progress",
      done: "done",
    };
    const roadmapStatus = statusMap[parsed.data.status];
    if (roadmapStatus) {
      await prisma.roadmapItem.updateMany({
        where: { feedbackPostId: id },
        data: { status: roadmapStatus },
      });
    }

    dispatchWebhook(admin.org.id, {
      event: "post.status_changed",
      org: orgSlug,
      data: {
        post: { id: updated.id, title: updated.title, status: updated.status },
        previousStatus,
        newStatus: updated.status,
      },
    });
  }

  return ok({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    status: updated.status,
    votes: updated.voteCount,
    commentCount: updated._count.comments,
    category: updated.category,
    author: { email: updated.authorEmail, name: updated.authorName },
    pinned: updated.pinned,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;

  const admin = await verifyAdminAccess(orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  const post = await prisma.feedbackPost.findFirst({
    where: { id, orgId: admin.org.id },
  });
  if (!post) return errors.notFound("Post not found.");

  await prisma.feedbackPost.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
