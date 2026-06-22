import { useState } from "react";
import { toast } from "sonner";
import type { Category } from "./types";

export function useCategoryManagement(
  orgSlug: string,
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
) {
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366f1");
  const [catLoading, setCatLoading] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, color: newCatColor }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.detail ?? "Failed to create category."); return; }
      setCategories((prev) => [...prev, data]);
      setNewCatName("");
      setNewCatColor("#6366f1");
      toast.success("Category created.");
    } catch {
      toast.error("Failed to create category.");
    } finally {
      setCatLoading(false);
    }
  }

  async function handleDeleteCategory(catId: string) {
    setDeletingCatId(null);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/categories/${catId}`, { method: "DELETE" });
      if (!res.ok) toast.error("Failed to delete category.");
      else toast.success("Category deleted.");
    } catch {
      toast.error("Failed to delete category.");
    }
  }

  return {
    catDialogOpen,
    setCatDialogOpen,
    newCatName,
    setNewCatName,
    newCatColor,
    setNewCatColor,
    catLoading,
    deletingCatId,
    setDeletingCatId,
    handleAddCategory,
    handleDeleteCategory,
  };
}
