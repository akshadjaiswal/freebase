"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import { MessageSquare, BookOpen, Map, Settings, Plus, ExternalLink, Search } from "lucide-react";

interface FeedbackPost {
  id: string;
  title: string;
  status: string;
}

interface Props {
  orgSlug: string;
}

export function CommandPalette({ orgSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggle]);

  useEffect(() => {
    if (!open) { setQuery(""); setPosts([]); return; }
    if (query.length < 2) { setPosts([]); return; }

    const controller = new AbortController();
    setSearching(true);

    fetch(`/api/v1/orgs/${orgSlug}/posts?q=${encodeURIComponent(query)}&limit=6`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.data ?? []);
        setSearching(false);
      })
      .catch(() => setSearching(false));

    return () => controller.abort();
  }, [query, open, orgSlug]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  function go(path: string) {
    router.push(path);
    setOpen(false);
  }

  const base = `/${orgSlug}`;
  const showNavigation = query.length < 2;

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--text-muted)] [&_[cmdk-group-heading]]:py-1.5"
        >
          <div className="flex items-center border-b border-[var(--border)] px-3">
            <Search className="h-3.5 w-3.5 text-[var(--text-muted)] mr-2 shrink-0" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search feedback or jump to…"
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-80 overflow-y-auto p-1.5">
            <CommandEmpty className="py-6 text-center text-sm text-[var(--text-muted)]">
              {searching ? "Searching…" : "No results."}
            </CommandEmpty>

            {posts.length > 0 && (
              <CommandGroup heading="Feedback posts">
                {posts.map((post) => (
                  <CommandItem
                    key={post.id}
                    value={post.id}
                    onSelect={() => go(`${base}/admin/feedback`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{post.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{post.status}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showNavigation && (
              <>
                <CommandGroup heading="Navigate">
                  <CommandItem
                    value="feedback"
                    onSelect={() => go(`${base}/admin/feedback`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </CommandItem>
                  <CommandItem
                    value="changelog"
                    onSelect={() => go(`${base}/admin/changelog`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <BookOpen className="h-4 w-4" />
                    Changelog
                  </CommandItem>
                  <CommandItem
                    value="roadmap"
                    onSelect={() => go(`${base}/admin/roadmap`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <Map className="h-4 w-4" />
                    Roadmap
                  </CommandItem>
                  <CommandItem
                    value="settings"
                    onSelect={() => go(`${base}/admin/settings`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1 h-px bg-[var(--border)]" />

                <CommandGroup heading="Create">
                  <CommandItem
                    value="new-changelog"
                    onSelect={() => go(`${base}/admin/changelog/new`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <Plus className="h-4 w-4" />
                    New changelog entry
                  </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1 h-px bg-[var(--border)]" />

                <CommandGroup heading="Public pages">
                  <CommandItem
                    value="view-feedback"
                    onSelect={() => go(`${base}/feedback`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View feedback board
                  </CommandItem>
                  <CommandItem
                    value="view-changelog"
                    onSelect={() => go(`${base}/changelog`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View changelog
                  </CommandItem>
                  <CommandItem
                    value="view-roadmap"
                    onSelect={() => go(`${base}/roadmap`)}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] px-2.5 py-2 text-sm text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] aria-selected:bg-[var(--accent-subtle)] aria-selected:text-[var(--accent)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View roadmap
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>

          <div className="border-t border-[var(--border)] px-3 py-2 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
          </div>
        </Command>
      </div>
    </div>,
    document.body
  );
}
