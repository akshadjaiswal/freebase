import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getFeedbackPageData = (orgId: string) =>
  unstable_cache(
    async () => {
      const [posts, categories] = await Promise.all([
        prisma.feedbackPost.findMany({
          where: { orgId },
          orderBy: [{ pinned: "desc" }, { voteCount: "desc" }, { createdAt: "desc" }],
          include: {
            category: { select: { id: true, name: true, color: true } },
            _count: { select: { comments: true, votes: true } },
          },
        }),
        prisma.category.findMany({
          where: { orgId },
          orderBy: { name: "asc" },
        }),
      ]);
      return { posts, categories };
    },
    [`feedback-${orgId}`],
    { tags: [`org-${orgId}`, `feedback-${orgId}`], revalidate: 60 }
  )();

export const getChangelogPageData = (orgId: string) =>
  unstable_cache(
    async () =>
      prisma.changelogPost.findMany({
        where: { orgId },
        orderBy: [{ createdAt: "desc" }],
      }),
    [`changelog-${orgId}`],
    { tags: [`org-${orgId}`, `changelog-${orgId}`], revalidate: 60 }
  )();

export const getRoadmapPageData = (orgId: string) =>
  unstable_cache(
    async () => {
      const [items, feedbackPosts] = await Promise.all([
        prisma.roadmapItem.findMany({
          where: { orgId },
          orderBy: [{ position: "asc" }],
          include: {
            feedbackPost: { select: { voteCount: true } },
          },
        }),
        prisma.feedbackPost.findMany({
          where: { orgId },
          orderBy: { voteCount: "desc" },
          select: { id: true, title: true, voteCount: true, status: true },
        }),
      ]);
      return { items, feedbackPosts };
    },
    [`roadmap-${orgId}`],
    { tags: [`org-${orgId}`, `roadmap-${orgId}`], revalidate: 60 }
  )();

export const getSettingsPageData = (orgId: string) =>
  unstable_cache(
    async () => {
      const [apiKeys, webhooks] = await Promise.all([
        prisma.apiKey.findMany({
          where: { orgId },
          select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.webhook.findMany({
          where: { orgId },
          select: { id: true, url: true, events: true, active: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);
      return { apiKeys, webhooks };
    },
    [`settings-${orgId}`],
    { tags: [`org-${orgId}`, `settings-${orgId}`] }
  )();
