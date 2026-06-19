import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { AdminFeedbackClient } from "./admin-feedback-client";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function AdminFeedbackPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const session = await verifyAdminAccess(orgSlug);
  if (!session) redirect(`/login?org=${orgSlug}`);

  const [posts, categories] = await Promise.all([
    prisma.feedbackPost.findMany({
      where: { orgId: session.org.id },
      orderBy: [{ pinned: "desc" }, { voteCount: "desc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, name: true, color: true } },
        _count: { select: { comments: true, votes: true } },
      },
    }),
    prisma.category.findMany({
      where: { orgId: session.org.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminFeedbackClient
      orgSlug={orgSlug}
      initialPosts={posts.map((p: (typeof posts)[0]) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        votes: p.voteCount,
        commentCount: p._count.comments,
        category: p.category,
        pinned: p.pinned,
        author: { email: p.authorEmail, name: p.authorName },
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))}
      initialCategories={categories.map((c: (typeof categories)[0]) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      }))}
    />
  );
}
