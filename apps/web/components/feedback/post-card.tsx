"use client";

import { MessageSquare, Pin } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { VoteButton } from "./vote-button";
import { cn } from "@/lib/cn";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface PostCardProps {
  post: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    votes: number;
    commentCount: number;
    category?: Category | null;
    pinned: boolean;
    createdAt: string | Date;
  };
  orgSlug: string;
  onClick?: () => void;
}

export function PostCard({ post, orgSlug, onClick }: PostCardProps) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors",
        "hover:border-[var(--border)]/80 hover:bg-[var(--surface-raised)]"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`View feedback: ${post.title}`}
    >
      {/* Vote button — stop propagation so clicking vote doesn't open modal */}
      <div onClick={(e) => e.stopPropagation()}>
        <VoteButton
          postId={post.id}
          orgSlug={orgSlug}
          initialVotes={post.votes}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug">
            {post.pinned && (
              <Pin className="mr-1.5 inline-block h-3 w-3 text-[var(--accent)]" aria-label="Pinned" />
            )}
            {post.title}
          </h3>
        </div>

        {post.description && (
          <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)] leading-relaxed">
            {post.description}
          </p>
        )}

        <div className="mt-2.5 flex items-center gap-2">
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

          <span className="ml-auto flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <MessageSquare className="h-3 w-3" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}
