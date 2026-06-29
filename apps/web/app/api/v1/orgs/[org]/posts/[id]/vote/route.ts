import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { verifyWidgetJwt } from "@/lib/jwt";
import { getVoteLimiter, getClientIp } from "@/lib/rate-limit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Freebase-User",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function buildFingerprint(ip: string, ua: string, orgId: string): string {
  return createHash("sha256").update(`${ip}|${ua}|${orgId}`).digest("hex");
}

const voteSchema = z.object({
  email: z.string().email().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id: postId } = await params;

  const limiter = getVoteLimiter();
  if (limiter) {
    const ip = getClientIp(request);
    const result = await limiter.limit(ip);
    if (!result.success) {
      return errors.rateLimited(Math.ceil((result.reset - Date.now()) / 1000));
    }
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, secretKey: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  const post = await prisma.feedbackPost.findFirst({
    where: { id: postId, orgId: org.id },
    select: { id: true, voteCount: true },
  });
  if (!post) return errors.notFound("Post not found.");

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  const parsed = voteSchema.safeParse(body);
  const voterEmail = parsed.success ? parsed.data.email : undefined;

  // userId only from verified JWT header — never from request body
  let jwtUserId: string | null = null;
  const widgetToken = request.headers.get("x-freebase-user");
  if (widgetToken) {
    const payload = await verifyWidgetJwt(widgetToken, org.secretKey);
    if (payload) jwtUserId = payload.userId;
  }

  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "unknown";
  const voterFingerprint = buildFingerprint(ip, ua, org.id);

  // Check for existing vote — priority: userId > email > fingerprint
  let existingVote = null;
  if (jwtUserId) {
    existingVote = await prisma.feedbackVote.findUnique({
      where: { postId_userId: { postId, userId: jwtUserId } },
    });
  } else if (voterEmail) {
    existingVote = await prisma.feedbackVote.findUnique({
      where: { postId_voterEmail: { postId, voterEmail } },
    });
  } else {
    existingVote = await prisma.feedbackVote.findUnique({
      where: { postId_voterFingerprint: { postId, voterFingerprint } },
    });
  }

  if (existingVote) return errors.conflict("Already voted on this post.");

  await prisma.$transaction([
    prisma.feedbackVote.create({
      data: {
        postId,
        voterEmail: voterEmail ?? null,
        voterFingerprint: jwtUserId ? null : voterFingerprint,
        userId: jwtUserId ?? null,
      },
    }),
    prisma.feedbackPost.update({
      where: { id: postId },
      data: { voteCount: { increment: 1 } },
    }),
  ]);

  const updated = await prisma.feedbackPost.findUnique({
    where: { id: postId },
    select: { voteCount: true },
  });

  return ok({ votes: updated!.voteCount, voted: true }, 201, corsHeaders);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id: postId } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, secretKey: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  const post = await prisma.feedbackPost.findFirst({
    where: { id: postId, orgId: org.id },
    select: { id: true },
  });
  if (!post) return errors.notFound("Post not found.");

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  const parsed = voteSchema.safeParse(body);
  const voterEmail = parsed.success ? parsed.data.email : undefined;

  // userId only from verified JWT header — never from request body
  let jwtUserId: string | null = null;
  const widgetToken = request.headers.get("x-freebase-user");
  if (widgetToken) {
    const payload = await verifyWidgetJwt(widgetToken, org.secretKey);
    if (payload) jwtUserId = payload.userId;
  }

  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "unknown";
  const voterFingerprint = buildFingerprint(ip, ua, org.id);

  let existingVote = null;
  if (jwtUserId) {
    existingVote = await prisma.feedbackVote.findUnique({
      where: { postId_userId: { postId, userId: jwtUserId } },
    });
  } else if (voterEmail) {
    existingVote = await prisma.feedbackVote.findUnique({
      where: { postId_voterEmail: { postId, voterEmail } },
    });
  } else {
    existingVote = await prisma.feedbackVote.findUnique({
      where: { postId_voterFingerprint: { postId, voterFingerprint } },
    });
  }

  if (!existingVote) return errors.notFound("No vote found to remove.");

  await prisma.$transaction([
    prisma.feedbackVote.delete({ where: { id: existingVote.id } }),
    prisma.feedbackPost.update({
      where: { id: postId },
      data: { voteCount: { decrement: 1 } },
    }),
  ]);

  const updated = await prisma.feedbackPost.findUnique({
    where: { id: postId },
    select: { voteCount: true },
  });

  return ok({ votes: Math.max(0, updated!.voteCount), voted: false }, 200, corsHeaders);
}
