"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/feedback/post-card";
import { PostForm } from "@/components/feedback/post-form";
import { PostDetail } from "@/components/feedback/post-detail";
import { cn } from "@/lib/cn";

type Status = "all" | "open" | "planned" | "in-progress" | "done" | "closed";
type SortKey = "votes" | "created_at" | "updated_at";

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

interface FeedbackBoardProps {
  orgSlug: string;
  orgId: string;
  categories: Category[];
  initialStatus?: string;
  initialSort?: string;
  initialQuery?: string;
}

const STATUS_TABS: { key: Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "planned", label: "Planned" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
  { key: "closed", label: "Closed" },
];

export function FeedbackBoard({
  orgSlug,
  categories,
  initialStatus,
  initialSort,
  initialQuery,
}: FeedbackBoardProps) {
  const [status, setStatus] = useState<Status>((initialStatus as Status) || "all");
  const [sort, setSort] = useState<SortKey>((initialSort as SortKey) || "votes");
  const [query, setQuery] = useState(initialQuery || "");
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery || "");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPosts = useCallback(
    async (reset = true) => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      params.set("sort", sort);
      if (debouncedQuery) params.set("q", debouncedQuery);
      params.set("limit", "20");
      if (!reset && cursor) params.set("cursor", cursor);

      try {
        if (reset) setLoading(true);
        else setLoadingMore(true);

        const res = await fetch(`/api/v1/orgs/${orgSlug}/posts?${params}`);
        if (!res.ok) return;
        const data = await res.json();

        if (reset) {
          setPosts(data.data);
        } else {
          setPosts((prev) => [...prev, ...data.data]);
        }
        setTotal(data.pagination.total);
        setHasMore(data.pagination.hasMore);
        setCursor(data.pagination.nextCursor);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [orgSlug, status, sort, debouncedQuery, cursor]
  );

  // Reset + fetch when filters change
  useEffect(() => {
    setCursor(null);
    fetchPosts(true);
  }, [status, sort, debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePostSubmitted(newPost: { id: string; title: string }) {
    setSubmitOpen(false);
    // Prepend a placeholder and refetch
    fetchPosts(true);
  }

  function handleLoadMore() {
    fetchPosts(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Feedback</h1>
          <p className="text-xs text-[var(--text-muted)]">{total} posts</p>
        </div>
        <Button onClick={() => setSubmitOpen(true)}>
          <Plus className="h-4 w-4" />
          Submit feedback
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={cn(
                "rounded-[var(--radius)] px-2.5 py-1 text-xs font-medium transition-colors",
                status === tab.key
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + sort row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search feedback…"
              className={cn(
                "h-8 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] pl-8 pr-8 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                "focus:border-[var(--accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
              )}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-36">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">Most voted</SelectItem>
              <SelectItem value="created_at">Newest</SelectItem>
              <SelectItem value="updated_at">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Post list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-md)]" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] py-16 text-center">
          <p className="text-sm font-medium text-[var(--text-secondary)]">No feedback found</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {query ? "Try a different search term." : "Be the first to submit feedback!"}
          </p>
          {!query && (
            <Button size="sm" className="mt-4" onClick={() => setSubmitOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Submit feedback
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              orgSlug={orgSlug}
              onClick={() => setSelectedPost(post)}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Submit feedback dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit feedback</DialogTitle>
            <DialogDescription>Share your idea or report an issue.</DialogDescription>
          </DialogHeader>
          <PostForm
            orgSlug={orgSlug}
            categories={categories}
            onSuccess={handlePostSubmitted}
            onCancel={() => setSubmitOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Post detail dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-h-[80vh] max-w-xl overflow-hidden p-0">
          <DialogTitle className="sr-only">{selectedPost?.title ?? "Feedback post"}</DialogTitle>
          <DialogDescription className="sr-only">Feedback post details and comments</DialogDescription>
          {selectedPost && (
            <PostDetail
              post={selectedPost}
              orgSlug={orgSlug}
              onClose={() => setSelectedPost(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
