"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Pin,
  PinOff,
  Trash2,
  MessageSquare,
  ChevronUp,
  Plus,
  X,
  Tag,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/feedback/status-badge";
import { cn } from "@/lib/cn";

type StatusValue = "open" | "planned" | "in-progress" | "done" | "closed";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Post {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  votes: number;
  commentCount: number;
  category?: Category | null;
  pinned: boolean;
  author: { email: string; name?: string | null };
  createdAt: string;
  updatedAt: string;
}

interface AdminFeedbackClientProps {
  orgSlug: string;
  initialPosts: Post[];
  initialCategories: Category[];
}

const STATUSES: StatusValue[] = ["open", "planned", "in-progress", "done", "closed"];
const STATUS_FILTER_TABS = ["all", ...STATUSES] as const;

export function AdminFeedbackClient({ orgSlug, initialPosts, initialCategories }: AdminFeedbackClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<typeof STATUS_FILTER_TABS[number]>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<StatusValue | "">("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Category management
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [catLoading, setCatLoading] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Detail dialog
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const [detailComments, setDetailComments] = useState<{ id: string; body: string; author: { email: string; name?: string | null }; createdAt: string }[]>([]);
  const [detailCommentsLoading, setDetailCommentsLoading] = useState(false);
  const [detailCommentBody, setDetailCommentBody] = useState("");
  const [detailCommentEmail, setDetailCommentEmail] = useState("");
  const [detailCommentSubmitting, setDetailCommentSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  async function openDetail(post: Post) {
    setDetailPost(post);
    setDetailComments([]);
    setDetailCommentsLoading(true);
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setDetailComments(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setDetailCommentsLoading(false);
    }
  }

  async function handleDetailCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detailPost || !detailCommentBody.trim() || !detailCommentEmail.trim()) return;
    setDetailCommentSubmitting(true);
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${detailPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: detailCommentBody, authorEmail: detailCommentEmail }),
      });
      if (!res.ok) { toast.error("Failed to post comment."); return; }
      const newComment = await res.json();
      setDetailComments((prev) => [...prev, newComment]);
      setPosts((ps) => ps.map((p) => p.id === detailPost.id ? { ...p, commentCount: p.commentCount + 1 } : p));
      setDetailCommentBody("");
      toast.success("Comment posted.");
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setDetailCommentSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!detailPost) return;
    setDeletingCommentId(null);
    setDetailComments((prev) => prev.filter((c) => c.id !== commentId));
    setPosts((ps) => ps.map((p) => p.id === detailPost.id ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p));
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${detailPost.id}/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) toast.error("Failed to delete comment.");
    } catch {
      toast.error("Failed to delete comment.");
    }
  }

  const filteredPosts = activeTab === "all" ? posts : posts.filter((p) => p.status === activeTab);

  async function handleStatusChange(postId: string, newStatus: StatusValue) {
    const prev = posts.find((p) => p.id === postId);
    if (!prev || prev.status === newStatus) return;

    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, status: newStatus } : p)));

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, status: prev.status } : p)));
        toast.error("Failed to update status.");
      }
    } catch {
      setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, status: prev.status } : p)));
      toast.error("Failed to update status.");
    }
  }

  async function handlePin(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const newPinned = !post.pinned;

    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, pinned: newPinned } : p)));

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: newPinned }),
      });
      if (!res.ok) {
        setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, pinned: post.pinned } : p)));
        toast.error("Failed to update pin.");
      } else {
        toast.success(newPinned ? "Post pinned." : "Post unpinned.");
      }
    } catch {
      setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, pinned: post.pinned } : p)));
      toast.error("Failed to update pin.");
    }
  }

  async function handleDelete(postId: string) {
    setDeletingId(null);
    setPosts((ps) => ps.filter((p) => p.id !== postId));

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        // Refetch to restore
        toast.error("Failed to delete post.");
      } else {
        toast.success("Post deleted.");
      }
    } catch {
      toast.error("Failed to delete post.");
    }
  }

  async function handleBulkStatusChange() {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkLoading(true);

    const ids = Array.from(selectedIds);
    const prevStatuses = Object.fromEntries(ids.map((id) => [id, posts.find((p) => p.id === id)?.status]));

    setPosts((ps) =>
      ps.map((p) => (selectedIds.has(p.id) ? { ...p, status: bulkStatus } : p))
    );

    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/v1/orgs/${orgSlug}/posts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bulkStatus }),
        }).then((r) => ({ id, ok: r.ok }))
      )
    );

    const failedIds = new Set(
      results
        .filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok))
        .map((r) => (r.status === "fulfilled" ? r.value.id : null))
        .filter(Boolean) as string[]
    );

    if (failedIds.size > 0) {
      // Roll back only failed items
      setPosts((ps) =>
        ps.map((p) =>
          failedIds.has(p.id) && prevStatuses[p.id] ? { ...p, status: prevStatuses[p.id]! } : p
        )
      );
      const succeeded = ids.length - failedIds.size;
      toast.error(`${succeeded} of ${ids.length} updated. ${failedIds.size} failed.`);
    } else {
      toast.success(`Updated ${ids.length} posts to "${bulkStatus}".`);
    }

    setSelectedIds(new Set());
    setBulkStatus("");
    setBulkLoading(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map((p) => p.id)));
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, color: newCatColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail ?? "Failed to create category.");
        return;
      }
      setCategories((prev) => [...prev, data]);
      setNewCatName("");
      setNewCatColor("#6366f1");
      toast.success("Category created.");
    } catch {
      toast.error("Failed to create category.");
    } finally {
      setCatLoading(false);
    }
  }

  async function handleDeleteCategory(catId: string) {
    setDeletingCatId(null);
    setCategories((prev) => prev.filter((c) => c.id !== catId));

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/categories/${catId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete category.");
      } else {
        toast.success("Category deleted.");
      }
    } catch {
      toast.error("Failed to delete category.");
    }
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Feedback</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{posts.length} total posts</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCatDialogOpen(true)}>
          <Tag className="h-3.5 w-3.5" />
          Manage categories
        </Button>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex gap-1">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-[var(--radius)] px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              activeTab === tab
                ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab === "in-progress" ? "In Progress" : tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--accent)]/20 bg-[var(--accent-subtle)] px-4 py-2">
          <span className="text-xs font-medium text-[var(--accent)]">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as StatusValue)}>
              <SelectTrigger className="h-7 w-36 text-xs">
                <SelectValue placeholder="Change status…" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!bulkStatus || bulkLoading}
              onClick={handleBulkStatusChange}
              className="h-7 text-xs"
            >
              Apply
            </Button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-[var(--accent)] hover:opacity-70"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border)]">
        {/* Table header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
            onChange={toggleSelectAll}
            className="h-3.5 w-3.5 accent-[var(--accent)]"
            aria-label="Select all"
          />
          <span className="flex-1">Title</span>
          <span className="w-24 text-center">Status</span>
          <span className="w-14 text-center">Votes</span>
          <span className="w-14 text-center">Comments</span>
          <span className="w-28">Date</span>
          <span className="w-8" />
        </div>

        {/* Rows */}
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            No feedback posts here yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={cn(
                  "flex items-center gap-3 bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-raised)]",
                  selectedIds.has(post.id) && "bg-[var(--accent-subtle)]/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(post.id)}
                  onChange={() => toggleSelect(post.id)}
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${post.title}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {post.pinned && <Pin className="h-3 w-3 flex-shrink-0 text-[var(--accent)]" />}
                    <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {post.title}
                    </span>
                    {post.category && (
                      <span
                        className="flex-shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${post.category.color}18`,
                          color: post.category.color,
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{post.author.email}</p>
                </div>

                <div className="w-24 flex justify-center">
                  <Select
                    value={post.status}
                    onValueChange={(v) => handleStatusChange(post.id, v as StatusValue)}
                  >
                    <SelectTrigger className="h-6 w-24 border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 [&>svg]:hidden">
                      <StatusBadge status={post.status} />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex w-14 items-center justify-center gap-1 text-xs text-[var(--text-secondary)]">
                  <ChevronUp className="h-3 w-3" />
                  {post.votes}
                </div>

                <div className="flex w-14 items-center justify-center gap-1 text-xs text-[var(--text-secondary)]">
                  <MessageSquare className="h-3 w-3" />
                  {post.commentCount}
                </div>

                <div className="w-28 text-xs text-[var(--text-muted)]">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>

                <div className="w-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDetail(post)}>
                        <Eye className="h-3.5 w-3.5" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePin(post.id)}>
                        {post.pinned ? (
                          <><PinOff className="h-3.5 w-3.5" /> Unpin</>
                        ) : (
                          <><Pin className="h-3.5 w-3.5" /> Pin to top</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-[var(--error)] focus:text-[var(--error)]"
                        onClick={() => setDeletingId(post.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post detail dialog */}
      <Dialog open={!!detailPost} onOpenChange={(open) => !open && setDetailPost(null)}>
        <DialogContent className="max-w-xl flex flex-col gap-0 p-0 max-h-[85vh]">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-[var(--border)] shrink-0">
            <DialogTitle className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
              {detailPost?.title ?? "Post details"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {detailPost && <StatusBadge status={detailPost.status} />}
                {detailPost?.category && (
                  <span
                    className="inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${detailPost.category.color}18`, color: detailPost.category.color }}
                  >
                    {detailPost.category.name}
                  </span>
                )}
                {detailPost && (
                  <span className="text-xs text-[var(--text-muted)]">
                    by {detailPost.author.name ?? detailPost.author.email}
                  </span>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          {detailPost && <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {detailPost.description && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {detailPost.description}
              </p>
            )}

            {/* Admin controls */}
            <div className="flex flex-wrap items-end gap-3 pb-4 border-b border-[var(--border)]">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[var(--text-muted)]">Status</span>
                <Select
                  value={detailPost.status}
                  onValueChange={(v) => {
                    handleStatusChange(detailPost.id, v as StatusValue);
                    setDetailPost((p) => p ? { ...p, status: v } : p);
                  }}
                >
                  <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
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
                    value={detailPost.category?.id ?? "none"}
                    onValueChange={async (v) => {
                      const catId = v === "none" ? null : v;
                      const cat = categories.find((c) => c.id === catId) ?? null;
                      setDetailPost((p) => p ? { ...p, category: cat } : p);
                      setPosts((ps) => ps.map((p) => p.id === detailPost.id ? { ...p, category: cat } : p));
                      await fetch(`/api/v1/orgs/${orgSlug}/posts/${detailPost.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ categoryId: catId }),
                      });
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
                    Comments ({detailComments.length})
                  </h3>

                  {detailCommentsLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-10 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-raised)]" />
                      ))}
                    </div>
                  ) : detailComments.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)]">No comments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailComments.map((comment) => (
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
                                <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-[var(--error)] hover:underline">Yes</button>
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

                  {/* Admin reply form */}
                  <form onSubmit={handleDetailCommentSubmit} className="mt-3 space-y-2">
                    <Textarea
                      value={detailCommentBody}
                      onChange={(e) => setDetailCommentBody(e.target.value)}
                      placeholder="Reply as admin…"
                      rows={2}
                      maxLength={1000}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        value={detailCommentEmail}
                        onChange={(e) => setDetailCommentEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 text-xs h-7"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={detailCommentSubmitting || !detailCommentBody.trim() || !detailCommentEmail.trim()}
                      >
                        {detailCommentSubmitting ? "Posting…" : "Post"}
                      </Button>
                    </div>
                  </form>
                </div>
          </div>}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete post</DialogTitle>
            <DialogDescription>
              This will permanently delete the post and all its votes and comments. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingId && handleDelete(deletingId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category management dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
            <DialogDescription>Create or delete categories for feedback posts.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Existing categories */}
            {categories.length > 0 ? (
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                    </div>
                    {deletingCatId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[var(--text-muted)]">Confirm?</span>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-xs text-[var(--error)] hover:underline"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingCatId(null)}
                          className="text-xs text-[var(--text-muted)] hover:underline"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingCatId(cat.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--error)]"
                        aria-label={`Delete ${cat.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No categories yet.</p>
            )}

            {/* Add category form */}
            <form onSubmit={handleAddCategory} className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Add category</Label>
              <div className="flex gap-2">
                <Input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  maxLength={50}
                  className="flex-1"
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-0.5"
                  title="Pick color"
                />
                <Button type="submit" size="sm" disabled={!newCatName.trim() || catLoading}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
