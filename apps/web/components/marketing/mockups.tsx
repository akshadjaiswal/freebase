"use client";

import { ChevronUp, MessageCircle, Map, Bell } from "lucide-react";
import { motion } from "motion/react";

export function FeedbackBoardMockup() {
  const posts = [
    { title: "Dark mode support", votes: 47, status: "planned", statusLabel: "Planned" },
    { title: "CSV export for all feedback", votes: 31, status: "in-progress", statusLabel: "In Progress" },
    { title: "Slack integration for new posts", votes: 24, status: "open", statusLabel: "Open" },
  ];

  const statusColors: Record<string, string> = {
    planned: "var(--status-planned)",
    "in-progress": "var(--status-in-progress)",
    open: "var(--status-open)",
  };
  const statusBgColors: Record<string, string> = {
    planned: "var(--status-planned-bg)",
    "in-progress": "var(--status-in-progress-bg)",
    open: "var(--status-open-bg)",
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-primary)]">Feedback Board</span>
        <span className="text-xs text-[var(--text-muted)]">72 posts</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {posts.map((post) => (
          <div key={post.title} className="flex items-center gap-3 px-4 py-3">
            <div className="flex flex-col items-center gap-0.5 rounded-[var(--radius)] border border-[var(--border)] px-2 py-1.5 min-w-[40px]">
              <ChevronUp className="h-3 w-3 text-[var(--text-muted)]" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">{post.votes}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{post.title}</p>
            </div>
            <span
              className="shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: statusBgColors[post.status], color: statusColors[post.status] }}
            >
              {post.statusLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChangelogMockup() {
  const entries = [
    { label: "New Feature", labelColor: "#10b981", labelBg: "rgba(16,185,129,0.12)", date: "Jun 2025", title: "Embeddable widget v2" },
    { label: "Improvement", labelColor: "#6366f1", labelBg: "rgba(99,102,241,0.12)", date: "May 2025", title: "Faster feedback board loading" },
    { label: "Fix", labelColor: "#f59e0b", labelBg: "rgba(245,158,11,0.12)", date: "May 2025", title: "Vote count now syncs in real time" },
  ];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-primary)]">Changelog</span>
        <span className="text-xs text-[var(--accent)] cursor-pointer">Subscribe</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {entries.map((entry) => (
          <div key={entry.title} className="px-4 py-3 flex items-start gap-3">
            <span
              className="mt-0.5 shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: entry.labelBg, color: entry.labelColor }}
            >
              {entry.label}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{entry.title}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{entry.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoadmapMockup() {
  const columns = [
    { label: "Planned", color: "var(--status-planned)", items: ["Zapier integration", "Public API v2"] },
    { label: "In Progress", color: "var(--status-in-progress)", items: ["Mobile push notifications"] },
    { label: "Done", color: "var(--status-done)", items: ["Embeddable widget", "RSS feed"] },
  ];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <span className="text-xs font-medium text-[var(--text-primary)]">Roadmap</span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-[var(--border)]">
        {columns.map((col) => (
          <div key={col.label} className="bg-[var(--surface)] p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">{col.label}</span>
            </div>
            <div className="space-y-1.5">
              {col.items.map((item) => (
                <div key={item} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1.5">
                  <p className="text-[10px] font-medium text-[var(--text-primary)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WidgetMockup() {
  return (
    <div className="relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 overflow-hidden min-h-[240px]">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[var(--error)]/50" />
        <div className="h-2 w-2 rounded-full bg-[var(--warning)]/50" />
        <div className="h-2 w-2 rounded-full bg-[var(--accent)]/50" />
        <span className="ml-1 text-[10px] text-[var(--text-muted)]">your-app.com</span>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-raised)] p-3">
        <p className="mb-2 text-xs font-medium text-[var(--text-primary)]">Share feedback</p>
        <div className="mb-2 h-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 flex items-center">
          <span className="text-[10px] text-[var(--text-muted)]">What feature would you like to see?</span>
        </div>
        <div className="h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 pt-1">
          <span className="text-[10px] text-[var(--text-muted)]">Describe your idea...</span>
        </div>
        <div className="mt-2 flex justify-end">
          <div className="rounded-[var(--radius)] bg-[var(--accent)] px-2.5 py-1">
            <span className="text-[10px] font-medium text-[var(--accent-foreground)]">Submit</span>
          </div>
        </div>
      </div>
      {/* Collapsed launcher — animated loop showing it fan out into a menu and back */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end">
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-overlay)]"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.18, 0.7, 0.88] }}
        >
          <Map className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
        </motion.div>
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-overlay)]"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.18, 0.7, 0.88], delay: 0.08 }}
        >
          <Bell className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
        </motion.div>
        <motion.div
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] shadow-lg"
          animate={{ scale: [1, 1, 1.06, 1, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.15, 0.22, 0.3, 1] }}
        >
          <MessageCircle className="h-4 w-4 text-[var(--accent-foreground)]" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--error)] text-[8px] font-bold text-white">3</span>
        </motion.div>
      </div>
    </div>
  );
}
