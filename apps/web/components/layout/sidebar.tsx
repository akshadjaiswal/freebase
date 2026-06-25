"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  BookOpen,
  Map,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  orgSlug: string;
  orgName: string;
  userEmail: string;
}

const navItems = [
  { href: "admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "admin/changelog", label: "Changelog", icon: BookOpen },
  { href: "admin/roadmap", label: "Roadmap", icon: Map },
];

export function Sidebar({ orgSlug, orgName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const base = `/${orgSlug}`;

  function isActive(href: string) {
    return pathname.startsWith(`${base}/${href}`);
  }

  const initials = userEmail
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className="flex h-screen w-[var(--sidebar-width)] flex-col border-r border-[var(--border)] bg-[var(--surface)]"
      style={{ position: "sticky", top: 0 }}
    >
      {/* Logo + org name */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--border)] px-4">
        <Logo size={18} />
        <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {orgName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={`${base}/${href}`}
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-1.5 text-sm transition-colors",
              isActive(href)
                ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="my-2 h-px bg-[var(--border)]" />

        <Link
          href={`${base}/admin/settings`}
          className={cn(
            "flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-1.5 text-sm transition-colors",
            isActive("admin/settings")
              ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </nav>

      {/* ⌘K hint */}
      <div className="px-3 pb-1">
        <button
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
          }}
          className="w-full flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-raised)] transition-colors"
        >
          <span className="flex-1 text-left">Search…</span>
          <kbd className="font-mono text-[10px]">⌘K</kbd>
        </button>
      </div>

      {/* Footer: user + theme toggle */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-[var(--text-muted)] truncate">{userEmail}</span>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
