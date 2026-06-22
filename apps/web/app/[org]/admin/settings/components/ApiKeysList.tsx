"use client";

import { Key, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiKeyItem, ConfirmAction } from "../hooks/types";

interface ApiKeysListProps {
  apiKeys: ApiKeyItem[];
  onNew: () => void;
  onDelete: (action: ConfirmAction) => void;
}

export function ApiKeysList({ apiKeys, onNew, onDelete }: ApiKeysListProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-[var(--text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">API Keys</h2>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" /> New key
        </Button>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
        {apiKeys.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">No API keys yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{key.name}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{key.keyPrefix}…</p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                </span>
                <button
                  onClick={() => onDelete({ type: "delete-key", id: key.id })}
                  className="rounded p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  aria-label={`Delete key ${key.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
