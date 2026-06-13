import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { errors, ok, encodeCursor, decodeCursor } from "@/lib/api";

function tiptapToText(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const doc = body as { content?: unknown[] };
  if (!Array.isArray(doc.content)) return "";
  const parts: string[] = [];
  const extract = (nodes: unknown[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as { text?: string; content?: unknown[] };
      if (n.text) parts.push(n.text);
      if (Array.isArray(n.content)) extract(n.content);
    }
  };
  extract(doc.content);
  return parts.join(" ");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return errors.notFound("Organization not found.");

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "published";
  const label = searchParams.get("label") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const cursor = searchParams.get("cursor") ?? undefined;

  const validStatuses = ["draft", "published", "all"];
  if (!validStatuses.includes(status)) return errors.badRequest("Invalid status filter.");

  const where = {
    orgId: org.id,
    ...(status !== "all" ? { status } : {}),
    ...(label ? { label } : {}),
  };

  // For public (published only), sort by publishedAt desc; for admin/all, sort by createdAt desc
  const sortByPublished = status === "published";

  let cursorWhere = {};
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) return errors.badRequest("Invalid cursor.");
    const sortField = sortByPublished ? "publishedAt" : "createdAt";
    cursorWhere = {
      OR: [
        { [sortField]: { lt: new Date(decoded.createdAt) } },
        { [sortField]: new Date(decoded.createdAt), id: { lt: decoded.id } },
      ],
    };
  }

  const orderBy = sortByPublished
    ? [{ publishedAt: "desc" as const }, { id: "desc" as const }]
    : [{ createdAt: "desc" as const }, { id: "desc" as const }];

  const [posts, total] = await Promise.all([
    prisma.changelogPost.findMany({
      where: { ...where, ...cursorWhere },
      orderBy,
      take: limit + 1,
    }),
    prisma.changelogPost.count({ where }),
  ]);

  const hasMore = posts.length > limit;
  const items = posts.slice(0, limit);
  const lastItem = items[items.length - 1];
  const nextCursor = hasMore && lastItem
    ? encodeCursor(lastItem.id, sortByPublished ? (lastItem.publishedAt ?? lastItem.createdAt) : lastItem.createdAt)
    : null;

  return ok({
    data: items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      label: p.label,
      status: p.status,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      excerpt: tiptapToText(p.body).slice(0, 200),
    })),
    pagination: { hasMore, nextCursor, total },
  });
}

const createSchema = z.object({
  title: z.string().min(1).max(200).transform((s) => s.trim()),
  body: z.record(z.unknown()).optional().default({}),
  label: z.enum(["feature", "improvement", "bug-fix", "announcement"]),
  status: z.enum(["draft", "published"]).default("draft"),
  slug: z.string().max(120).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;

  const admin = await verifyAdminAccess(orgSlug);
  if (!admin) return errors.unauthorized("Admin access required.");

  const body = await req.json().catch(() => null);
  if (!body) return errors.badRequest("Invalid JSON body.");

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest(parsed.error.issues[0].message);

  const { title, body: richBody, label, status, slug: rawSlug } = parsed.data;

  const baseSlug = rawSlug ? slugify(rawSlug) : slugify(title);
  if (!baseSlug) return errors.badRequest("Could not generate a valid slug from title.");

  // Ensure slug uniqueness within org
  let finalSlug = baseSlug;
  let attempt = 0;
  while (true) {
    const existing = await prisma.changelogPost.findUnique({
      where: { orgId_slug: { orgId: admin.org.id, slug: finalSlug } },
    });
    if (!existing) break;
    attempt++;
    finalSlug = `${baseSlug}-${attempt}`;
  }

  const post = await prisma.changelogPost.create({
    data: {
      orgId: admin.org.id,
      title,
      slug: finalSlug,
      body: richBody as unknown as import("@prisma/client").Prisma.InputJsonValue,
      label,
      status,
      publishedAt: status === "published" ? new Date() : null,
    },
  });

  return ok(post, 201);
}
