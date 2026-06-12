"use client";

import { useState, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

interface VoteButtonProps {
  postId: string;
  orgSlug: string;
  initialVotes: number;
  initialVoted?: boolean;
}

export function VoteButton({ postId, orgSlug, initialVotes, initialVoted = false }: VoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [votes, setVotes] = useState(initialVotes);
  const [isPending, startTransition] = useTransition();

  async function handleVote() {
    const wasVoted = voted;

    // Optimistic update
    setVoted(!wasVoted);
    setVotes((v) => (wasVoted ? v - 1 : v + 1));

    startTransition(async () => {
      try {
        const method = wasVoted ? "DELETE" : "POST";
        const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}/vote`, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (res.status === 409) {
          // Already voted — keep optimistic state as voted
          setVoted(true);
          return;
        }

        if (!res.ok) {
          // Revert on error
          setVoted(wasVoted);
          setVotes((v) => (wasVoted ? v + 1 : v - 1));
          toast.error("Failed to record vote. Try again.");
          return;
        }

        const data = await res.json();
        setVotes(data.votes);
        setVoted(data.voted);
      } catch {
        setVoted(wasVoted);
        setVotes((v) => (wasVoted ? v + 1 : v - 1));
        toast.error("Failed to record vote. Try again.");
      }
    });
  }

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "flex min-w-[48px] flex-col items-center gap-0.5 rounded-[var(--radius)] border px-2 py-1.5 text-xs font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "disabled:pointer-events-none disabled:opacity-50",
        voted
          ? "border-[var(--accent)]/40 bg-[var(--accent-subtle)] text-[var(--accent)]"
          : "border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]"
      )}
      aria-label={voted ? `Remove vote (${votes} votes)` : `Vote (${votes} votes)`}
    >
      <ChevronUp className={cn("h-4 w-4", voted && "text-[var(--accent)]")} />
      <span>{votes}</span>
    </button>
  );
}
