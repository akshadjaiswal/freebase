"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Best-effort, non-blocking — remembers the active org for next login's auto-redirect
function rememberOrg(slug: string) {
  createClient().auth.updateUser({ data: { orgSlug: slug } }).catch(() => {});
}

const APP_HOST = (process.env.NEXT_PUBLIC_APP_URL ?? "https://freebase.app").replace(/^https?:\/\//, "");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

interface CreateOrgDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrgDialog({ open, onClose }: CreateOrgDialogProps) {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleOrgNameChange(value: string) {
    setOrgName(value);
    if (!slugManual) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlug(slugify(value));
    setSlugManual(true);
  }

  function reset() {
    setOrgName("");
    setSlug("");
    setSlugManual(false);
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!orgName.trim()) newErrors.orgName = "Org name is required.";
    if (!slug.trim() || slug.length < 3) newErrors.slug = "Slug must be at least 3 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      const res = await fetch("/api/auth/create-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName: orgName.trim(), slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(Object.fromEntries(data.errors.map((e: { field: string; message: string }) => [e.field, e.message])));
        } else {
          setErrors({ form: data.detail ?? "Something went wrong. Please try again." });
        }
        return;
      }

      reset();
      onClose();
      rememberOrg(slug);
      router.push(`/${slug}/admin/feedback`);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
          <DialogDescription>Set up a separate Freebase workspace for another project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-org-name">Organization name</Label>
            <Input
              id="new-org-name"
              placeholder="Acme Inc."
              value={orgName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              error={errors.orgName}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-org-slug">
              URL slug
              <span className="ml-1 text-[var(--text-muted)]">· used in your org&apos;s public URL</span>
            </Label>
            <div className="flex items-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] focus-within:ring-1 focus-within:ring-[var(--accent)] focus-within:border-[var(--accent)] transition-colors">
              <span className="pl-3 shrink-0 text-xs text-[var(--text-muted)] pointer-events-none select-none whitespace-nowrap">
                {APP_HOST}/
              </span>
              <input
                id="new-org-slug"
                placeholder="acme"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
            </div>
            {errors.slug && <p className="text-xs text-[var(--error)] mt-1">{errors.slug}</p>}
          </div>

          {errors.form && <p className="text-xs text-[var(--error)]">{errors.form}</p>}

          <Button type="submit" className="w-full gap-2" disabled={isPending}>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPending ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
