import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errors, ok, encodeCursor, decodeCursor } from "@/lib/api";
import { verifyAdminAccess } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";
import { getPostSubmitLimiter, getClientIp } from "@/lib/rate-limit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Freebase-User",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id: postId } = await params;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
  const cursor = searchParams.get("cursor") ?? undefined;

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

  const [isAdmin, total] = await Promise.all([
    verifyAdminAccess(orgSlug).catch(() => null),
    prisma.feedbackComment.count({ where: { postId } }),
  ]);

  const where: { postId: string; createdAt?: { gt: Date } } = { postId };
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      where.createdAt = { gt: new Date(decoded.createdAt) };
    }
  }

  const comments = await prisma.feedbackComment.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: limit + 1,
  });

  const hasMore = comments.length > limit;
  const page = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore
    ? encodeCursor(page[page.length - 1].id, page[page.length - 1].createdAt)
    : null;

  return ok({
    data: page.map((c) => ({
      id: c.id,
      body: c.body,
      author: isAdmin ? { email: c.authorEmail, name: c.authorName } : { name: c.authorName ?? null },
      createdAt: c.createdAt,
    })),
    pagination: { hasMore, nextCursor, total },
  }, 200, corsHeaders);
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

  const limiter = getPostSubmitLimiter();
  if (limiter) {
    const ip = getClientIp(request);
    const result = await limiter.limit(ip);
    if (!result.success) {
      return errors.rateLimited(Math.ceil((result.reset - Date.now()) / 1000));
    }
  }

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

  return ok(result, 201, corsHeaders);
}
