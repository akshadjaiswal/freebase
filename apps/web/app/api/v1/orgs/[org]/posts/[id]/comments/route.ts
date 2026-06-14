import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { dispatchWebhook } from "@/lib/webhooks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id: postId } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  const post = await prisma.feedbackPost.findFirst({
    where: { id: postId, orgId: org.id },
    select: { id: true },
  });
  if (!post) return errors.notFound("Post not found.");

  const comments = await prisma.feedbackComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
  });

  return ok({
    data: comments.map((c: (typeof comments)[0]) => ({
      id: c.id,
      body: c.body,
      author: { email: c.authorEmail, name: c.authorName },
      createdAt: c.createdAt,
    })),
    pagination: { hasMore: false, total: comments.length },
  });
}

const createCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment max 1000 characters."),
  authorEmail: z.string().email("Valid email required."),
  authorName: z.string().max(100).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id: postId } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  const post = await prisma.feedbackPost.findFirst({
    where: { id: postId, orgId: org.id },
    select: { id: true },
  });
  if (!post) return errors.notFound("Post not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Invalid JSON body.");
  }

  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest("Validation failed.", parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })));
  }

  const comment = await prisma.feedbackComment.create({
    data: {
      postId,
      body: parsed.data.body,
      authorEmail: parsed.data.authorEmail,
      authorName: parsed.data.authorName,
    },
  });

  const result = {
    id: comment.id,
    body: comment.body,
    author: { email: comment.authorEmail, name: comment.authorName },
    createdAt: comment.createdAt,
  };

  dispatchWebhook(org.id, {
    event: "comment.created",
    org: orgSlug,
    data: { postId, comment: result },
  });

  return ok(result, 201);
}
