"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/feedback/status-badge";
import { CategoryChip } from "@/components/feedback/category-chip";
import { STATUSES, type Post, type Comment, type Category, type StatusValue } from "../hooks/types";

interface PostDetailModalProps {
  post: Post | null;
  categories: Category[];
  comments: Comment[];
  commentsLoading: boolean;
  commentBody: string;
  setCommentBody: (v: string) => void;
  commentEmail: string;
  setCommentEmail: (v: string) => void;
  commentSubmitting: boolean;
  deletingCommentId: string | null;
  setDeletingCommentId: (id: string | null) => void;
  onClose: () => void;
  onStatusChange: (id: string, status: StatusValue) => void;
  onCategoryChange: (postId: string, catId: string | null, cat: Category | null) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: string) => void;
  setDetailPost: (patch: ((p: Post | null) => Post | null)) => void;
}

export function PostDetailModal({
  post, categories, comments, commentsLoading, commentBody, setCommentBody,
  commentEmail, setCommentEmail, commentSubmitting, deletingCommentId, setDeletingCommentId,
  onClose, onStatusChange, onCategoryChange, onCommentSubmit, onDeleteComment, setDetailPost,
}: PostDetailModalProps) {
  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl flex flex-col gap-0 p-0 max-h-[85vh]">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-[var(--border)] shrink-0">
          <DialogTitle className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
            {post?.title ?? "Post details"}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {post && <StatusBadge status={post.status} />}
              {post?.category && (
                <CategoryChip name={post.category.name} color={post.category.color} />
              )}
              {post && (
                <span className="text-xs text-[var(--text-muted)]">
                  by {post.author.name ?? post.author.email}
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {post && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {post.description && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            )}

            {/* Admin controls */}
            <div className="flex flex-wrap items-end gap-3 pb-4 border-b border-[var(--border)]">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--text-muted)]">Status</span>
                <Select
                  value={post.status}
                  onValueChange={(v) => {
                    onStatusChange(post.id, v as StatusValue);
                    setDetailPost((p) => p ? { ...p, status: v } : p);
                  }}
                >
                  <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {categories.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--text-muted)]">Category</span>
                  <Select
                    value={post.category?.id ?? "none"}
                    onValueChange={(v) => {
                      const catId = v === "none" ? null : v;
                      const cat = categories.find((c) => c.id === catId) ?? null;
                      onCategoryChange(post.id, catId, cat);
                    }}
                  >
                    <SelectTrigger className="h-7 w-40 text-xs">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <MessageSquare className="h-3.5 w-3.5" />
                Comments ({comments.length})
              </h3>

              {commentsLoading ? (
                <div className="space-y-2 min-h-[80px]">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-raised)]" />
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">No comments yet.</p>
              ) : (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="group relative rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[9px] font-semibold uppercase text-[var(--text-muted)]">
                            {(comment.author.name ?? comment.author.email)[0]}
                          </div>
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {comment.author.name ?? comment.author.email}
                          </span>
                        </div>
                        {deletingCommentId === comment.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[var(--text-muted)]">Delete?</span>
                            <button onClick={() => onDeleteComment(comment.id)} className="text-xs text-[var(--error)] hover:underline">Yes</button>
                            <button onClick={() => setDeletingCommentId(null)} className="text-xs text-[var(--text-muted)] hover:underline">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingCommentId(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--error)] transition-opacity"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-primary)] leading-relaxed">{comment.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={onCommentSubmit} className="mt-3 space-y-2">
                <Textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Reply as admin…"
                  rows={2}
                  maxLength={1000}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 text-xs h-7"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={commentSubmitting || !commentBody.trim() || !commentEmail.trim()}
                  >
                    {commentSubmitting ? "Posting…" : "Post"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
