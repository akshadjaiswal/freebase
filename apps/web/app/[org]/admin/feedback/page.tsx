import { redirect } from "next/navigation";
import { verifyAdminAccess } from "@/lib/auth";
import { getFeedbackPageData } from "@/lib/data";
import { AdminFeedbackClient } from "./admin-feedback-client";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function AdminFeedbackPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const session = await verifyAdminAccess(orgSlug);
  if (!session) redirect(`/login?org=${orgSlug}`);

  const { posts, categories } = await getFeedbackPageData(session.org.id);

  return (
    <AdminFeedbackClient
      orgSlug={orgSlug}
      initialPosts={posts.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        votes: p.voteCount,
        commentCount: p._count.comments,
        category: p.category,
        pinned: p.pinned,
        author: { email: p.authorEmail, name: p.authorName },
        createdAt: new Date(p.createdAt).toISOString(),
        updatedAt: new Date(p.updatedAt).toISOString(),
      }))}
      initialCategories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      }))}
    />
  );
}
