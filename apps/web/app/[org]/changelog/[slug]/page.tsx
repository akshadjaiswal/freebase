import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { LabelBadge } from "@/components/changelog/changelog-entry";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link2 from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";

interface Props {
  params: Promise<{ org: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { org: orgSlug, slug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug }, select: { id: true, name: true } });
  if (!org) return {};
  const post = await prisma.changelogPost.findUnique({
    where: { orgId_slug: { orgId: org.id, slug } },
    select: { title: true },
  });
  if (!post) return {};
  return { title: `${post.title} — ${org.name}` };
}

export default async function ChangelogPostPage({ params }: Props) {
  const { org: orgSlug, slug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true, accentColor: true },
  });
  if (!org) notFound();

  const post = await prisma.changelogPost.findFirst({
    where: { orgId: org.id, slug, status: "published" },
  });
  if (!post) notFound();

  const html = generateHTML(post.body as Parameters<typeof generateHTML>[0], [
    StarterKit.configure({ codeBlock: false, heading: { levels: [2, 3] } }),
    Link2.configure({ openOnClick: false, HTMLAttributes: { class: "underline text-[var(--accent)]" } }),
    CodeBlock.configure({ HTMLAttributes: { class: "tiptap-code-block" } }),
  ]);

  const date = post.publishedAt
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(post.publishedAt)
    : "";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Topbar orgSlug={orgSlug} orgName={org.name} accentColor={org.accentColor} />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href={`/${orgSlug}/changelog`}
          className="mb-6 inline-flex text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          ← Back to changelog
        </Link>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <LabelBadge label={post.label} />
            {date && <span className="text-xs text-[var(--text-muted)]">{date}</span>}
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{post.title}</h1>
        </div>

        <div
          className="tiptap-output prose-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
