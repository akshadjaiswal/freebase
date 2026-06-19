import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { AdminRoadmapClient } from "@/components/roadmap/admin-roadmap-client";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function AdminRoadmapPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const session = await verifyAdminAccess(orgSlug);
  if (!session) redirect(`/login?next=/${orgSlug}/admin/roadmap`);

  const [items, feedbackPosts] = await Promise.all([
    prisma.roadmapItem.findMany({
      where: { orgId: session.org.id },
      orderBy: [{ position: "asc" }],
      include: {
        feedbackPost: { select: { voteCount: true } },
      },
    }),
    prisma.feedbackPost.findMany({
      where: { orgId: session.org.id },
      orderBy: { voteCount: "desc" },
      select: {
        id: true,
        title: true,
        voteCount: true,
        status: true,
      },
    }),
  ]);

  const format = (item: typeof items[number]) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    position: item.position,
    visible: item.visible,
    feedbackPostId: item.feedbackPostId,
    votes: item.feedbackPost?.voteCount ?? 0,
  });

  const initialData = {
    planned: items.filter((i) => i.status === "planned").map(format),
    inProgress: items.filter((i) => i.status === "in-progress").map(format),
    done: items.filter((i) => i.status === "done").map(format),
  };

  return (
    <AdminRoadmapClient
      orgSlug={orgSlug}
      initialData={initialData}
      feedbackPosts={feedbackPosts}
    />
  );
}
