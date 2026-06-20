import { NextRequest } from "next/server";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { verifyAdminAccess } from "@/lib/auth";

// GET /api/v1/orgs/[org]/roadmap — grouped by status
// Public: returns only visible=true items
// Admin (with Bearer token): returns all items including hidden
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found");

  // Check if admin viewing (Bearer token in header)
  const authHeader = request.headers.get("authorization");
  let isAdmin = false;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      await verifyAdminAccess(orgSlug);
      isAdmin = true;
    } catch {
      // not admin — public view
    }
  }

  const where = isAdmin
    ? { orgId: org.id }
    : { orgId: org.id, visible: true };

  const items = await prisma.roadmapItem.findMany({
    where,
    orderBy: [{ status: "asc" }, { position: "asc" }],
    include: {
      feedbackPost: {
        select: { id: true, voteCount: true },
      },
    },
  });

  const format = (item: typeof items[number]) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    position: item.position,
    visible: item.visible,
    feedbackPostId: item.feedbackPostId,
    votes: item.feedbackPost?.voteCount ?? 0,
    createdAt: item.createdAt,
  });

  return ok({
    planned: items.filter((i) => i.status === "planned").map(format),
    inProgress: items.filter((i) => i.status === "in-progress").map(format),
    done: items.filter((i) => i.status === "done").map(format),
  });
}

const createSchema = z.object({
  // Optional when promoting from feedback — title falls back to feedback post title
  title: z.string().max(200).transform((s) => s.trim()).optional(),
  feedbackPostId: z.string().optional().nullable(),
  status: z.enum(["planned", "in-progress", "done"]).default("planned"),
  visible: z.boolean().default(true),
});

// POST /api/v1/orgs/[org]/roadmap — create roadmap item (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  const adminCheck = await verifyAdminAccess(orgSlug).catch(() => null);
  if (!adminCheck) return errors.forbidden("Admin access required");

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Invalid JSON");
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return errors.badRequest(parsed.error.errors[0]?.message ?? "Invalid input");
  }

  const { title, feedbackPostId, status, visible } = parsed.data;

  // Standalone items require a title; feedback-promoted items can derive it from the post
  if (!feedbackPostId && !title) {
    return errors.badRequest("Title is required for standalone roadmap items");
  }

  // Validate feedbackPostId belongs to this org
  if (feedbackPostId) {
    const post = await prisma.feedbackPost.findFirst({
      where: { id: feedbackPostId, orgId: org.id },
      select: { id: true, title: true },
    });
    if (!post) return errors.notFound("Feedback post not found");
  }

  // Get next position in target column
  const maxPosition = await prisma.roadmapItem.aggregate({
    where: { orgId: org.id, status },
    _max: { position: true },
  });
  const position = (maxPosition._max.position ?? -1) + 1;

  // If linked to feedback post and no explicit title, derive from post
  let resolvedTitle = title ?? "";
  if (feedbackPostId && !title) {
    const post = await prisma.feedbackPost.findFirst({
      where: { id: feedbackPostId, orgId: org.id },
      select: { title: true },
    });
    resolvedTitle = post?.title ?? "";
  }

  if (!resolvedTitle) return errors.badRequest("Could not resolve a title for this item");

  const item = await prisma.roadmapItem.create({
    data: {
      orgId: org.id,
      title: resolvedTitle,
      feedbackPostId: feedbackPostId ?? null,
      status,
      position,
      visible,
    },
    include: {
      feedbackPost: { select: { id: true, voteCount: true } },
    },
  });

  revalidateTag(`roadmap-${org.id}`);

  return ok(
    {
      id: item.id,
      title: item.title,
      status: item.status,
      position: item.position,
      visible: item.visible,
      feedbackPostId: item.feedbackPostId,
      votes: item.feedbackPost?.voteCount ?? 0,
      createdAt: item.createdAt,
    },
    201
  );
}
