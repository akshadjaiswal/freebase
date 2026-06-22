"use client";

import { Webhook, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WebhookItem, ConfirmAction } from "../hooks/types";

interface WebhooksListProps {
  webhooks: WebhookItem[];
  onNew: () => void;
  onDelete: (action: ConfirmAction) => void;
  onToggle: (id: string, active: boolean) => void;
}

export function WebhooksList({ webhooks, onNew, onDelete, onToggle }: WebhooksListProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-[var(--text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Webhooks</h2>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" /> Add webhook
        </Button>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
        {webhooks.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">No webhooks yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {webhooks.map((wh) => (
              <div key={wh.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-[var(--text-primary)] truncate">{wh.url}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {wh.events.map((e) => (
                      <Badge key={e} variant="default" className="text-[10px] px-1.5 py-0">{e}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggle(wh.id, !wh.active)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      wh.active
                        ? "border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent-subtle)]"
                        : "border-[var(--border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {wh.active ? "Active" : "Paused"}
                  </button>
                  <button
                    onClick={() => onDelete({ type: "delete-webhook", id: wh.id })}
                    className="rounded p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                    aria-label={`Delete webhook ${wh.url}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
