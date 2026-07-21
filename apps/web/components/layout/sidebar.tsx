"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  BookOpen,
  Map,
  Settings,
  LogOut,
  Loader2,
  HelpCircle,
  ChevronsUpDown,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CreateOrgDialog } from "@/components/layout/create-org-dialog";
import { createClient } from "@/lib/supabase/client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Best-effort, non-blocking — remembers the active org for next login's auto-redirect
function rememberOrg(slug: string) {
  createClient().auth.updateUser({ data: { orgSlug: slug } }).catch(() => {});
}

const MAX_ORGS_PER_ACCOUNT = 5;

interface Membership {
  slug: string;
  name: string;
}

interface SidebarProps {
  orgSlug: string;
  orgName: string;
  userEmail: string;
  memberships: Membership[];
}

const navItems = [
  { href: "admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "admin/changelog", label: "Changelog", icon: BookOpen },
  { href: "admin/roadmap", label: "Roadmap", icon: Map },
];

export function Sidebar({ orgSlug, orgName, userEmail, memberships }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${orgSlug}`;
  const [signingOut, setSigningOut] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const atOrgLimit = memberships.length >= MAX_ORGS_PER_ACCOUNT;

  function handleSwitchOrg(targetSlug: string) {
    if (targetSlug === orgSlug) return;
    setSwitchingTo(targetSlug);
    rememberOrg(targetSlug);
    // Preserve the current subpath (e.g. stay on /admin/settings) rather than always bouncing to feedback
    const subpath = pathname.slice(base.length) || "/admin/feedback";
    startTransition(() => {
      router.push(`/${targetSlug}${subpath}`);
      router.refresh();
    });
  }

  async function handleSignout() {
    setSigningOut(true);
    await fetch(`/api/auth/signout?org=${orgSlug}`, { method: "POST" });
    router.push("/login");
  }

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
      {/* Org switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <button
            disabled={isPending}
            className="flex h-14 w-full items-center gap-2.5 border-b border-[var(--border)] px-4 text-left transition-colors hover:bg-[var(--surface-raised)] disabled:opacity-70 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
          >
            <Logo size={18} />
            <span className="flex-1 truncate text-sm font-semibold text-[var(--text-primary)]">
              {orgName}
            </span>
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--text-muted)]" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {memberships.map((m) => (
            <DropdownMenuItem
              key={m.slug}
              onSelect={() => handleSwitchOrg(m.slug)}
              disabled={isPending}
              className="justify-between"
            >
              <span className="truncate">{m.name}</span>
              {isPending && switchingTo === m.slug ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--text-muted)]" />
              ) : (
                m.slug === orgSlug && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {atOrgLimit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem disabled className="gap-2">
                    <Plus className="h-3.5 w-3.5" />
                    New organization
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              <TooltipContent>5 organization limit reached</TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenuItem className="gap-2" onSelect={() => setCreateOrgOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New organization
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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

      {/* Help / Docs link */}
      <div className="px-2 pb-1">
        <Link
          href="/docs"
          className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          Docs
        </Link>
      </div>

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

      {/* Footer: user + theme toggle + logout */}
      <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-[var(--text-muted)] truncate">{userEmail}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <button
            onClick={handleSignout}
            disabled={signingOut}
            aria-label="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          >
            {signingOut
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <LogOut className="h-3.5 w-3.5" />
            }
          </button>
        </div>
      </div>

      <CreateOrgDialog open={createOrgOpen} onClose={() => setCreateOrgOpen(false)} />
    </aside>
  );
}
