"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./status-badge";
import { VoteButton } from "./vote-button";

interface Comment {
  id: string;
  body: string;
  author: { email: string; name?: string | null };
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  votes: number;
  commentCount: number;
  category?: { id: string; name: string; color: string } | null;
  pinned: boolean;
  author: { email: string; name?: string | null };
  createdAt: string;
}

interface PostDetailProps {
  post: Post;
  orgSlug: string;
  onClose: () => void;
}

export function PostDetail({ post, orgSlug, onClose }: PostDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentName, setCommentName] = useState("");

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${post.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.data);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingComments(false);
      }
    }
    loadComments();
  }, [post.id, orgSlug]);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || !commentEmail.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: commentBody,
          authorEmail: commentEmail,
          authorName: commentName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.detail ?? "Failed to add comment.");
        return;
      }

      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setCommentBody("");
      toast.success("Comment added.");
    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-5">
        <div className="flex items-start gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <VoteButton postId={post.id} orgSlug={orgSlug} initialVotes={post.votes} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] leading-snug">{post.title}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={post.status} />
              {post.category && (
                <span
                  className="inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${post.category.color}18`,
                    color: post.category.color,
                  }}
                >
                  {post.category.name}
                </span>
              )}
              <span className="text-xs text-[var(--text-muted)]">
                by {post.author.name ?? post.author.email} ·{" "}
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-0.5 rounded-[var(--radius)] p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {post.description && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
        )}

        {/* Comments */}
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <MessageSquare className="h-3.5 w-3.5" />
            Comments ({comments.length})
          </h3>

          {loadingComments ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-raised)]" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[9px] font-semibold uppercase text-[var(--text-muted)]">
                      {(comment.author.name ?? comment.author.email)[0]}
                    </div>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {comment.author.name ?? comment.author.email}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{comment.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
            <Textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              maxLength={1000}
              required
            />
            <div className="flex gap-2">
              <Input
                type="email"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              <Input
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Name (optional)"
              />
            </div>
            <Button type="submit" size="sm" disabled={submitting || !commentBody.trim() || !commentEmail.trim()}>
              {submitting ? "Posting…" : "Post comment"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
