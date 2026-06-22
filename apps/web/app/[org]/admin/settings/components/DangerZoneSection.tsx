"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DangerZoneSectionProps {
  orgSlug: string;
  deleteConfirm: string;
  setDeleteConfirm: (v: string) => void;
  deleting: boolean;
  onDelete: () => void;
}

export function DangerZoneSection({ orgSlug, deleteConfirm, setDeleteConfirm, deleting, onDelete }: DangerZoneSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
      </div>
      <div className="rounded-[var(--radius-md)] border border-red-500/20 bg-[var(--surface)] p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Delete organization</p>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Permanently deletes all feedback posts, changelog entries, roadmap items, API keys, and webhooks. This cannot be undone.
          </p>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">
            Type <code className="text-red-400">{orgSlug}</code> to confirm
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder={orgSlug}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={deleteConfirm !== orgSlug || deleting}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
