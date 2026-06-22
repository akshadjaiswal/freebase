"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Category } from "../hooks/types";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  newCatName: string;
  setNewCatName: (v: string) => void;
  newCatColor: string;
  setNewCatColor: (v: string) => void;
  catLoading: boolean;
  deletingCatId: string | null;
  setDeletingCatId: (id: string | null) => void;
  onAddCategory: (e: React.FormEvent) => void;
  onDeleteCategory: (id: string) => void;
}

export function CategoryManagementDialog({
  open, onOpenChange, categories, newCatName, setNewCatName, newCatColor, setNewCatColor,
  catLoading, deletingCatId, setDeletingCatId, onAddCategory, onDeleteCategory,
}: CategoryManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage categories</DialogTitle>
          <DialogDescription>Create or delete categories for feedback posts.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {categories.length > 0 ? (
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                  </div>
                  {deletingCatId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[var(--text-muted)]">Confirm?</span>
                      <button onClick={() => onDeleteCategory(cat.id)} className="text-xs text-[var(--error)] hover:underline">Yes</button>
                      <button onClick={() => setDeletingCatId(null)} className="text-xs text-[var(--text-muted)] hover:underline">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingCatId(cat.id)} className="text-[var(--text-muted)] hover:text-[var(--error)]" aria-label={`Delete ${cat.name}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No categories yet.</p>
          )}

          <form onSubmit={onAddCategory} className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Add category</Label>
            <div className="flex gap-2">
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name"
                maxLength={50}
                className="flex-1"
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-0.5"
                title="Pick color"
                aria-label="Category color"
              />
              <Button type="submit" size="sm" disabled={!newCatName.trim() || catLoading}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
