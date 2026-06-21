import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { ChangelogEntry } from "@/components/changelog/changelog-entry";
import { SubscribeButton } from "@/components/changelog/subscribe-button";
import { getOrgBySlug, getPublicChangelogPageData } from "@/lib/data";

interface Props {
  params: Promise<{ org: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { org: orgSlug } = await params;
  const org = await getOrgBySlug(orgSlug);
  if (!org) return {};
  return { title: `${org.name} — Changelog` };
}

export default async function ChangelogPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const org = await getOrgBySlug(orgSlug);
  if (!org) notFound();

  const posts = await getPublicChangelogPageData(org.id);

  // Group by year-month
  const groups: { key: string; label: string; posts: typeof posts }[] = [];
  for (const post of posts) {
    const d = new Date(post.publishedAt ?? post.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
    const existing = groups.find((g) => g.key === key);
    if (existing) {
      existing.posts.push(post);
    } else {
      groups.push({ key, label, posts: [post] });
    }
  }

  const emailEnabled = !!process.env.EMAIL_FROM_DOMAIN;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Topbar orgSlug={orgSlug} orgName={org.name} />
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header row */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Changelog</h1>
          <div className="flex items-center gap-3">
            <a
              href={`/${orgSlug}/changelog/rss.xml`}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              RSS
            </a>
            {emailEnabled && <SubscribeButton orgSlug={orgSlug} />}
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="text-sm text-[var(--text-muted)]">No updates yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.key}>
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.posts.map((post) => (
                    <ChangelogEntry key={post.id} post={post} orgSlug={orgSlug} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
