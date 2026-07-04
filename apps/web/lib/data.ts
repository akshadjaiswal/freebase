import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ── type helpers ──────────────────────────────────────────────────────────────

const _feedbackFindMany = (orgId: string) =>
  prisma.feedbackPost.findMany({
    where: { orgId },
    orderBy: [{ pinned: "desc" }, { voteCount: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true, votes: true } },
    },
  });

const _categoryFindMany = (orgId: string) =>
  prisma.category.findMany({ where: { orgId }, orderBy: { name: "asc" } });

const _roadmapFindMany = (orgId: string) =>
  prisma.roadmapItem.findMany({
    where: { orgId },
    orderBy: [{ position: "asc" }],
    include: { feedbackPost: { select: { voteCount: true } } },
  });

const _feedbackForRoadmap = (orgId: string) =>
  prisma.feedbackPost.findMany({
    where: { orgId },
    orderBy: { voteCount: "desc" },
    select: { id: true, title: true, voteCount: true, status: true },
  });

const _apiKeyFindMany = (orgId: string) =>
  prisma.apiKey.findMany({
    where: { orgId },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

const _webhookFindMany = (orgId: string) =>
  prisma.webhook.findMany({
    where: { orgId },
    select: { id: true, url: true, events: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

const _changelogFindMany = (orgId: string) =>
  prisma.changelogPost.findMany({
    where: { orgId },
    orderBy: [{ createdAt: "desc" }],
  });

const _publicChangelogFindMany = (orgId: string) =>
  prisma.changelogPost.findMany({
    where: { orgId, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

const _publicRoadmapFindMany = (orgId: string) =>
  prisma.roadmapItem.findMany({
    where: { orgId, visible: true },
    orderBy: [{ position: "asc" }],
    include: { feedbackPost: { select: { voteCount: true } } },
  });

export type FeedbackPostRow = Awaited<ReturnType<typeof _feedbackFindMany>>[number];
export type CategoryRow = Awaited<ReturnType<typeof _categoryFindMany>>[number];
export type RoadmapItemRow = Awaited<ReturnType<typeof _roadmapFindMany>>[number];
export type FeedbackPostForRoadmap = Awaited<ReturnType<typeof _feedbackForRoadmap>>[number];
export type ApiKeyRow = Awaited<ReturnType<typeof _apiKeyFindMany>>[number];
export type WebhookRow = Awaited<ReturnType<typeof _webhookFindMany>>[number];
export type ChangelogPostRow = Awaited<ReturnType<typeof _changelogFindMany>>[number];
export type PublicChangelogPostRow = Awaited<ReturnType<typeof _publicChangelogFindMany>>[number];
export type PublicRoadmapItemRow = Awaited<ReturnType<typeof _publicRoadmapFindMany>>[number];

// ── admin data ────────────────────────────────────────────────────────────────

export const getFeedbackPageData = (orgId: string) =>
  unstable_cache(
    async () => {
      const [posts, categories] = await Promise.all([
        _feedbackFindMany(orgId),
        _categoryFindMany(orgId),
      ]);
      return { posts, categories };
    },
    [`feedback-${orgId}`],
    { tags: [`org-${orgId}`, `feedback-${orgId}`], revalidate: 60 }
  )() as Promise<{ posts: FeedbackPostRow[]; categories: CategoryRow[] }>;

export const getChangelogPageData = (orgId: string) =>
  unstable_cache(
    () => _changelogFindMany(orgId),
    [`changelog-${orgId}`],
    { tags: [`org-${orgId}`, `changelog-${orgId}`], revalidate: 60 }
  )() as Promise<ChangelogPostRow[]>;

export const getRoadmapPageData = (orgId: string) =>
  unstable_cache(
    async () => {
      const [items, feedbackPosts] = await Promise.all([
        _roadmapFindMany(orgId),
        _feedbackForRoadmap(orgId),
      ]);
      return { items, feedbackPosts };
    },
    [`roadmap-${orgId}`],
    { tags: [`org-${orgId}`, `roadmap-${orgId}`], revalidate: 60 }
  )() as Promise<{ items: RoadmapItemRow[]; feedbackPosts: FeedbackPostForRoadmap[] }>;

export const getSettingsPageData = (orgId: string) =>
  unstable_cache(
    async () => {
      const [apiKeys, webhooks] = await Promise.all([
        _apiKeyFindMany(orgId),
        _webhookFindMany(orgId),
      ]);
      return { apiKeys, webhooks };
    },
    [`settings-${orgId}`],
    { tags: [`org-${orgId}`, `settings-${orgId}`] }
  )() as Promise<{ apiKeys: ApiKeyRow[]; webhooks: WebhookRow[] }>;

// ── public data ───────────────────────────────────────────────────────────────

export const getOrgBySlug = (slug: string) =>
  unstable_cache(
    async () =>
      prisma.organization.findUnique({
        where: { slug },
        select: { id: true, name: true, accentColor: true, logoUrl: true },
      }),
    [`org-slug-${slug}`],
    { tags: [`org-slug-${slug}`], revalidate: 300 }
  )();

export const getPublicFeedbackPageData = (orgId: string) =>
  unstable_cache(
    async () => {
      const categories = await prisma.category.findMany({
        where: { orgId },
        orderBy: { name: "asc" },
        select: { id: true, name: true, color: true },
      });
      return { categories };
    },
    [`public-feedback-${orgId}`],
    { tags: [`org-${orgId}`, `feedback-${orgId}`], revalidate: 30 }
  )();

export const getPublicChangelogPageData = (orgId: string) =>
  unstable_cache(
    () => _publicChangelogFindMany(orgId),
    [`public-changelog-${orgId}`],
    { tags: [`org-${orgId}`, `changelog-${orgId}`], revalidate: 30 }
  )() as Promise<PublicChangelogPostRow[]>;

export const getPublicRoadmapPageData = (orgId: string) =>
  unstable_cache(
    () => _publicRoadmapFindMany(orgId),
    [`public-roadmap-${orgId}`],
    { tags: [`org-${orgId}`, `roadmap-${orgId}`], revalidate: 30 }
  )() as Promise<PublicRoadmapItemRow[]>;
