"use client";

import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Pin, PinOff, Trash2, MessageSquare, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/feedback/status-badge";
import { CategoryChip } from "@/components/feedback/category-chip";
import { cn } from "@/lib/cn";
import { STATUSES, type Post, type StatusValue } from "../hooks/types";

interface FeedbackTableRowProps {
  post: Post;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onStatusChange: (id: string, status: StatusValue) => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetail: (post: Post) => void;
}

export function FeedbackTableRow({ post, isSelected, onToggle, onStatusChange, onPin, onDelete, onViewDetail }: FeedbackTableRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-[var(--surface)] px-4 py-3 transition-colors hover:bg-[var(--surface-raised)]",
        isSelected && "bg-[var(--accent-subtle)]/30"
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(post.id)}
        onClick={(e) => e.stopPropagation()}
        className="h-3.5 w-3.5 accent-[var(--accent)]"
        aria-label={`Select ${post.title}`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {post.pinned && <Pin className="h-3 w-3 flex-shrink-0 text-[var(--accent)]" />}
          <span className="truncate text-sm font-medium text-[var(--text-primary)]">{post.title}</span>
          {post.category && (
            <CategoryChip name={post.category.name} color={post.category.color} className="flex-shrink-0" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{post.author.email}</p>
      </div>

      <div className="w-24 flex justify-center">
        <Select value={post.status} onValueChange={(v) => onStatusChange(post.id, v as StatusValue)}>
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
            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Post options">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetail(post)}>
              <Eye className="h-3.5 w-3.5" /> View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onPin(post.id)}>
              {post.pinned ? <><PinOff className="h-3.5 w-3.5" /> Unpin</> : <><Pin className="h-3.5 w-3.5" /> Pin to top</>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[var(--error)] focus:text-[var(--error)]"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
