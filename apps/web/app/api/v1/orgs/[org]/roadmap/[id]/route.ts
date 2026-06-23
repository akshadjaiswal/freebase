import { NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { verifyAdminAccess } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().min(1).max(200).transform((s) => s.trim()).optional(),
  status: z.enum(["planned", "in-progress", "done"]).optional(),
  position: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  feedbackPostId: z.string().nullable().optional(),
});

// Status mapping: roadmap → feedback post status
const roadmapToFeedbackStatus: Record<string, string> = {
  planned: "planned",
  "in-progress": "in-progress",
  done: "done",
};

// PATCH /api/v1/orgs/[org]/roadmap/[id] — update roadmap item (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;

  const adminCheck = await verifyAdminAccess(orgSlug).catch(() => null);
  if (!adminCheck) return errors.forbidden("Admin access required");

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found");

  const item = await prisma.roadmapItem.findFirst({
    where: { id, orgId: org.id },
    select: { id: true, status: true, feedbackPostId: true, position: true },
  });
  if (!item) return errors.notFound("Roadmap item not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Invalid JSON");
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest("Validation failed.", parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })));
  }

  const updates = parsed.data;
  const statusChanged = updates.status !== undefined && updates.status !== item.status;

  const updated = await prisma.roadmapItem.update({
    where: { id },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.position !== undefined && { position: updates.position }),
      ...(updates.visible !== undefined && { visible: updates.visible }),
      ...(updates.feedbackPostId !== undefined && {
        feedbackPostId: updates.feedbackPostId,
      }),
    },
    include: {
      feedbackPost: { select: { id: true, voteCount: true } },
    },
  });

  revalidateTag(`roadmap-${org.id}`);

  // Sync linked feedback post status when roadmap status changes
  if (statusChanged && updated.feedbackPostId) {
    const newFeedbackStatus = roadmapToFeedbackStatus[updates.status!];
    if (newFeedbackStatus) {
      await prisma.feedbackPost.update({
        where: { id: updated.feedbackPostId },
        data: { status: newFeedbackStatus },
      });
      revalidateTag(`feedback-${org.id}`);
    }
  }

  return ok({
    id: updated.id,
    title: updated.title,
    status: updated.status,
    position: updated.position,
    visible: updated.visible,
    feedbackPostId: updated.feedbackPostId,
    votes: updated.feedbackPost?.voteCount ?? 0,
    createdAt: updated.createdAt,
  });
}

// DELETE /api/v1/orgs/[org]/roadmap/[id] — delete roadmap item (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string }> }
) {
  const { org: orgSlug, id } = await params;

  const adminCheck = await verifyAdminAccess(orgSlug).catch(() => null);
  if (!adminCheck) return errors.forbidden("Admin access required");

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found");

  const item = await prisma.roadmapItem.findFirst({
    where: { id, orgId: org.id },
    select: { id: true },
  });
  if (!item) return errors.notFound("Roadmap item not found");

  await prisma.roadmapItem.delete({ where: { id } });

  revalidateTag(`roadmap-${org.id}`);

  return new Response(null, { status: 204 });
}
