"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { FieldInfo } from "@/components/ui/field-info";
import type { RoadmapItem } from "./roadmap-card";

type Status = "planned" | "in-progress" | "done";

interface FeedbackPost {
  id: string;
  title: string;
  voteCount: number;
  status: string;
}

interface Props {
  orgSlug: string;
  feedbackPosts: FeedbackPost[];
  onAdd: (item: RoadmapItem) => void;
  onClose: () => void;
}

export function AddRoadmapItemModal({ orgSlug, feedbackPosts, onAdd, onClose }: Props) {
  const [mode, setMode] = useState<"feedback" | "standalone">("feedback");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Status>("planned");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredPosts = feedbackPosts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSubmit() {
    setSaving(true);
    setError("");

    const body =
      mode === "feedback"
        ? { feedbackPostId: selectedPostId, title: title || undefined, status }
        : { title, status };

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail ?? "Failed to add item");
        return;
      }

      const item: RoadmapItem = await res.json();
      onAdd(item);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    !saving &&
    (mode === "feedback" ? !!selectedPostId : !!title.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-overlay)] p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Add roadmap item
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="mb-4 flex rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
          {(["feedback", "standalone"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-[var(--surface-raised)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {m === "feedback" ? (
                <span className="inline-flex items-center gap-1">
                  From feedback
                  <FieldInfo text="Links the roadmap item to a feedback post. Vote count stays visible and status stays in sync." />
                </span>
              ) : "Standalone"}
            </button>
          ))}
        </div>

        {/* Mode body */}
        {mode === "feedback" ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Search feedback posts
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredPosts.length === 0 && (
                <p className="py-4 text-center text-sm text-[var(--text-muted)]">
                  No posts found
                </p>
              )}
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`w-full rounded-[var(--radius)] border px-3 py-2 text-left text-sm transition-colors ${
                    selectedPostId === post.id
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface-raised)]"
                  }`}
                >
                  <span className="block font-medium leading-snug">{post.title}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {post.voteCount} votes · {post.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dark mode support"
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        )}

        {/* Column selector */}
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Column
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-[var(--radius)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
