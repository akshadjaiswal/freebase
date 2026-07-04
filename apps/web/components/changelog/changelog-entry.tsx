import Link from "next/link";

const LABEL_STYLES: Record<string, string> = {
  feature: "bg-[var(--accent-subtle)] text-[var(--accent)]",
  improvement: "bg-indigo-500/10 text-indigo-400",
  "bug-fix": "bg-red-500/10 text-red-400",
  announcement: "bg-amber-500/10 text-amber-400",
};

const LABEL_TEXT: Record<string, string> = {
  feature: "Feature",
  improvement: "Improvement",
  "bug-fix": "Bug Fix",
  announcement: "Announcement",
};

function tiptapToText(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const doc = body as { content?: unknown[] };
  if (!Array.isArray(doc.content)) return "";

  const parts: string[] = [];
  const extractText = (nodes: unknown[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as { type?: string; text?: string; content?: unknown[] };
      if (n.text) parts.push(n.text);
      if (Array.isArray(n.content)) extractText(n.content);
    }
  };
  extractText(doc.content);
  return parts.join(" ");
}

interface ChangelogEntryProps {
  post: { id: string; title: string; slug: string; label: string; publishedAt: Date | null; body: unknown };
  orgSlug: string;
}

export function ChangelogEntry({ post, orgSlug }: ChangelogEntryProps) {
  const labelStyle = LABEL_STYLES[post.label] ?? "bg-[var(--surface-raised)] text-[var(--text-secondary)]";
  const labelText = LABEL_TEXT[post.label] ?? post.label;
  const excerpt = tiptapToText(post.body).slice(0, 180);

  const date = post.publishedAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(post.publishedAt)
      )
    : "";

  return (
    <Link
      href={`/${orgSlug}/changelog/${post.slug}`}
      className="group block rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-subtle)] hover:bg-[var(--surface-raised)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium ${labelStyle}`}>
              {labelText}
            </span>
            {date && <span className="text-xs text-[var(--text-muted)]">{date}</span>}
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            {post.title}
          </h3>
          {excerpt && (
            <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--accent)] font-medium">Read more →</p>
    </Link>
  );
}

export function LabelBadge({ label }: { label: string }) {
  const style = LABEL_STYLES[label] ?? "bg-[var(--surface-raised)] text-[var(--text-secondary)]";
  const text = LABEL_TEXT[label] ?? label;
  return (
    <span className={`inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium ${style}`}>
      {text}
    </span>
  );
}
