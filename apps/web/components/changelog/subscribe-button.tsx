"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

interface SubscribeButtonProps {
  orgSlug: string;
}

export function SubscribeButton({ orgSlug }: SubscribeButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/changelog/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setState("success");
        setMessage(data.message ?? "Check your inbox to confirm.");
      } else {
        setState("error");
        setMessage(data.detail ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] transition-colors"
      >
        <Bell size={12} />
        Subscribe
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-overlay)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Subscribe to updates</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Get notified when new changelog entries are published.
            </p>

            {state === "success" ? (
              <div className="mt-4 rounded-[var(--radius)] bg-[var(--accent-subtle)] p-3 text-xs text-[var(--accent)]">
                {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
                {state === "error" && (
                  <p className="text-xs text-red-400">{message}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="flex-1 rounded-[var(--radius)] bg-[var(--accent)] py-2 text-xs font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  >
                    {state === "loading" ? "Sending…" : "Subscribe"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
