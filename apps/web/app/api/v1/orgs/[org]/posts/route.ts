import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errors, ok, encodeCursor, decodeCursor } from "@/lib/api";
import { verifyAdminAccess } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

const VALID_STATUSES = ["open", "planned", "in-progress", "done", "closed"] as const;
const VALID_SORTS = ["votes", "created_at", "updated_at"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;
  const { searchParams } = request.nextUrl;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  const isAdmin = await verifyAdminAccess(orgSlug).catch(() => null);

  const status = searchParams.get("status");
  const categoryId = searchParams.get("category");
  const sort = (searchParams.get("sort") ?? "votes") as typeof VALID_SORTS[number];
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";
  const limitRaw = parseInt(searchParams.get("limit") ?? "20", 10);
  const cursor = searchParams.get("cursor");
  const search = searchParams.get("q");

  if (limitRaw > 100) return errors.badRequest("limit cannot exceed 100.");
  const limit = Math.max(1, Math.min(limitRaw, 100));

  if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return errors.badRequest(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (sort && !VALID_SORTS.includes(sort)) {
    return errors.badRequest(`Invalid sort. Must be one of: ${VALID_SORTS.join(", ")}`);
  }

  const where: Record<string, unknown> = { orgId: org.id };
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      where.OR = [
        { createdAt: { lt: new Date(decoded.createdAt) } },
        { createdAt: new Date(decoded.createdAt), id: { lt: decoded.id } },
      ];
    }
  }

  const orderBy =
    sort === "votes"
      ? [{ voteCount: order }, { createdAt: "desc" as const }]
      : sort === "created_at"
      ? [{ createdAt: order }]
      : [{ updatedAt: order }];

  const [posts, total] = await Promise.all([
    prisma.feedbackPost.findMany({
      where,
      orderBy,
      take: limit + 1,
      include: {
        category: { select: { id: true, name: true, color: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.feedbackPost.count({ where: { orgId: org.id, ...(status ? { status } : {}) } }),
  ]);

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? encodeCursor(page[page.length - 1].id, page[page.length - 1].createdAt) : null;

  return ok({
    data: page.map((p: (typeof page)[0]) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      votes: p.voteCount,
      commentCount: p._count.comments,
      category: p.category,
      author: isAdmin ? { email: p.authorEmail, name: p.authorName } : { name: p.authorName ?? null },
      pinned: p.pinned,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    pagination: { hasMore, nextCursor, total },
  });
}

const createPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(150, "Title max 150 characters."),
  description: z.string().max(2000, "Description max 2000 characters.").optional(),
  categoryId: z.string().cuid("Invalid category ID.").optional(),
  authorEmail: z.string().email("Valid email required."),
  authorName: z.string().max(100).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ org: string }> }
) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return errors.notFound("Organization not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Invalid JSON body.");
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return errors.badRequest("Request body failed validation.", fieldErrors);
  }

  const { title, description, categoryId, authorEmail, authorName } = parsed.data;

  if (categoryId) {
    const cat = await prisma.category.findFirst({ where: { id: categoryId, orgId: org.id } });
    if (!cat) return errors.badRequest("Category not found in this organization.", [{ field: "categoryId", message: "Invalid category." }]);
  }

  const post = await prisma.feedbackPost.create({
    data: {
      orgId: org.id,
      title,
      description,
      categoryId,
      authorEmail,
      authorName,
    },
    include: {
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  const result = {
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
  };

  dispatchWebhook(org.id, {
    event: "post.created",
    org: orgSlug,
    data: { post: result },
  });

  return ok(result, 201);
}
