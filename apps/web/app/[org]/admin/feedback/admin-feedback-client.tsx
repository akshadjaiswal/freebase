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

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/v1/orgs/${orgSlug}/posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: bulkStatus }),
          })
        )
      );
      toast.success(`Updated ${ids.length} posts to "${bulkStatus}".`);
      setSelectedIds(new Set());
      setBulkStatus("");
    } catch {
      setPosts((ps) =>
        ps.map((p) => (prevStatuses[p.id] ? { ...p, status: prevStatuses[p.id]! } : p))
      );
      toast.error("Bulk update failed.");
    } finally {
      setBulkLoading(false);
    }
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
