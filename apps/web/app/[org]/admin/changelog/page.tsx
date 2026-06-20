import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAdminAccess } from "@/lib/auth";
import { getChangelogPageData } from "@/lib/data";
import { LabelBadge } from "@/components/changelog/changelog-entry";
import { Plus, FileText } from "lucide-react";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function AdminChangelogPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const admin = await verifyAdminAccess(orgSlug);
  if (!admin) redirect("/login");

  const posts = await getChangelogPageData(admin.org.id);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Changelog</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Write and publish updates for {admin.org.name}
          </p>
        </div>
        <Link
          href={`/${orgSlug}/admin/changelog/new`}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus size={14} />
          New entry
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">No changelog entries yet</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Create your first entry to keep users updated.</p>
          <Link
            href={`/${orgSlug}/admin/changelog/new`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Plus size={14} />
            New entry
          </Link>
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]">Label</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)]">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {posts.map((post) => {
                const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <tr key={post.id} className="hover:bg-[var(--surface-raised)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{post.title}</td>
                    <td className="px-4 py-3">
                      <LabelBadge label={post.label} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium ${
                          post.status === "published"
                            ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                            : "bg-[var(--surface-raised)] text-[var(--text-muted)]"
                        }`}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/${orgSlug}/admin/changelog/${post.id}`}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
