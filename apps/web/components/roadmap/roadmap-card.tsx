"use client";

import Link from "next/link";
import { ChevronUp, EyeOff } from "lucide-react";

export interface RoadmapItem {
  id: string;
  title: string;
  status: string;
  position: number;
  visible: boolean;
  feedbackPostId: string | null;
  votes: number;
}

interface RoadmapCardProps {
  item: RoadmapItem;
  /** Org slug — used to build feedback link on public cards */
  orgSlug?: string;
  /** Show admin controls (visibility toggle, delete) */
  admin?: boolean;
  /** Called when visibility toggled */
  onToggleVisible?: (id: string, visible: boolean) => void;
  /** Called when delete clicked */
  onDelete?: (id: string) => void;
  /** Whether card is being dragged */
  isDragging?: boolean;
}

export function RoadmapCard({
  item,
  orgSlug,
  admin,
  onToggleVisible,
  onDelete,
  isDragging,
}: RoadmapCardProps) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 transition-all ${
        isDragging ? "opacity-50 shadow-lg" : "hover:border-[var(--border-subtle)]"
      } ${!item.visible && admin ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[var(--text-primary)] leading-snug flex-1">
          {item.title}
        </p>
        {admin && !item.visible && (
          <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {item.votes > 0 ? (
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <ChevronUp className="h-3.5 w-3.5" />
            <span className="text-xs">{item.votes}</span>
          </div>
        ) : (
          <span />
        )}

        {/* "Promoted from feedback" link — public view only */}
        {!admin && orgSlug && item.feedbackPostId && (
          <Link
            href={`/${orgSlug}/feedback`}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            From feedback ↗
          </Link>
        )}

        {admin && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleVisible?.(item.id, !item.visible)}
              className="rounded px-1.5 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] transition-colors"
            >
              {item.visible ? "Hide" : "Show"}
            </button>
            <button
              onClick={() => onDelete?.(item.id)}
              className="rounded px-1.5 py-0.5 text-xs text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--surface-raised)] transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
