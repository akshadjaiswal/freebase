"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "./tiptap-editor";
import { ChevronLeft, Save, Globe, Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Label = "feature" | "improvement" | "bug-fix" | "announcement";
type Status = "draft" | "published";

interface ChangelogEditorProps {
  orgSlug: string;
  initialData?: {
    id: string;
    slug: string;
    title: string;
    body: Record<string, unknown>;
    label: Label;
    status: Status;
  };
}

const LABELS: { value: Label; label: string }[] = [
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "bug-fix", label: "Bug Fix" },
  { value: "announcement", label: "Announcement" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100);
}

export function ChangelogEditor({ orgSlug, initialData }: ChangelogEditorProps) {
  const router = useRouter();
  const isNew = !initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [label, setLabel] = useState<Label>(initialData?.label ?? "feature");
  const [status, setStatus] = useState<Status>(initialData?.status ?? "draft");
  const [body, setBody] = useState<Record<string, unknown>>(initialData?.body ?? {});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  const handleSlugChange = (val: string) => {
    setSlug(slugify(val));
    setSlugEdited(true);
  };

  const handleEditorChange = useCallback((content: Record<string, unknown>) => {
    setBody(content);
  }, []);

  const handleDelete = async () => {
    if (!initialData) return;
    setDeleting(true);
    const res = await fetch(`/api/v1/orgs/${orgSlug}/changelog/${initialData.slug}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      router.push(`/${orgSlug}/admin/changelog`);
      router.refresh();
    } else {
      setDeleting(false);
      setError("Failed to delete entry.");
    }
  };

  const save = async (targetStatus: Status) => {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);

    const url = isNew
      ? `/api/v1/orgs/${orgSlug}/changelog`
      : `/api/v1/orgs/${orgSlug}/changelog/${initialData!.slug}`;

    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug: slug || slugify(title), body, label, status: targetStatus }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? "Failed to save.");
      setSaving(false);
      return;
    }

    const data = await res.json();
    setStatus(targetStatus);

    if (isNew) {
      router.push(`/${orgSlug}/admin/changelog/${data.id}`);
    } else {
      router.refresh();
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <Link
            href={`/${orgSlug}/admin/changelog`}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft size={14} />
            Changelog
          </Link>
          <span className="text-[var(--border)]">/</span>
          <span className="text-xs text-[var(--text-secondary)]">{isNew ? "New entry" : "Edit entry"}</span>
        </div>
        <div className="flex items-center gap-2">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {!isNew && (
            <button
              onClick={() => setDeleteOpen(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          >
            <Save size={12} />
            Save draft
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            <Globe size={12} />
            {status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        {/* Meta fields */}
        <div className="mb-5 space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Entry title"
              className="w-full bg-transparent text-2xl font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Slug */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--text-muted)]">Slug:</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated"
                className="w-48 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1 text-xs text-[var(--text-secondary)] font-mono focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Label */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--text-muted)]">Label:</span>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value as Label)}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
              >
                {LABELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Status badge */}
            <span className={`inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium ${
              status === "published"
                ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "bg-[var(--surface-raised)] text-[var(--text-muted)]"
            }`}>
              {status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Editor */}
        <TiptapEditor content={body} onChange={handleEditorChange} />
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete entry</DialogTitle>
            <DialogDescription>
              This will permanently delete this changelog entry. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
