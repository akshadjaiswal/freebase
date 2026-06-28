import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errors } from "@/lib/api";
import { verifyAdminOrApiKey } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ org: string; id: string; commentId: string }> }
) {
  const { org: orgSlug, id: postId, commentId } = await params;

  const admin = await verifyAdminOrApiKey(request, orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  const comment = await prisma.feedbackComment.findFirst({
    where: {
      id: commentId,
      postId,
      post: { orgId: admin.orgId },
    },
  });
  if (!comment) return errors.notFound("Comment not found.");

  await prisma.feedbackComment.delete({ where: { id: commentId } });

  return new Response(null, { status: 204 });
}
