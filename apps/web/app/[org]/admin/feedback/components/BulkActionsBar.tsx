"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, type StatusValue } from "../hooks/types";

interface BulkActionsBarProps {
  count: number;
  bulkStatus: StatusValue | "";
  bulkLoading: boolean;
  onStatusChange: (s: StatusValue) => void;
  onApply: () => void;
  onClear: () => void;
}

export function BulkActionsBar({ count, bulkStatus, bulkLoading, onStatusChange, onApply, onClear }: BulkActionsBarProps) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--accent)]/20 bg-[var(--accent-subtle)] px-4 py-2">
      <span className="text-xs font-medium text-[var(--accent)]">{count} selected</span>
      <div className="flex items-center gap-2">
        <Select value={bulkStatus} onValueChange={(v) => onStatusChange(v as StatusValue)}>
          <SelectTrigger className="h-7 w-36 text-xs">
            <SelectValue placeholder="Change status…" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" disabled={!bulkStatus || bulkLoading} onClick={onApply} className="h-7 text-xs">
          Apply
        </Button>
      </div>
      <button onClick={onClear} className="ml-auto text-[var(--accent)] hover:opacity-70" aria-label="Clear selection">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
