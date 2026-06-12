"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface PostFormProps {
  orgSlug: string;
  categories: Category[];
  onSuccess: (post: { id: string; title: string }) => void;
  onCancel: () => void;
}

export function PostForm({ orgSlug, categories, onSuccess, onCancel }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = fd.get("description") as string;
    const categoryId = fd.get("categoryId") as string;
    const authorEmail = fd.get("authorEmail") as string;
    const authorName = fd.get("authorName") as string;

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          categoryId: categoryId && categoryId !== "none" ? categoryId : undefined,
          authorEmail,
          authorName: authorName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const err of data.errors) {
            fieldErrors[err.field] = err.message;
          }
          setErrors(fieldErrors);
        } else {
          toast.error(data.detail ?? "Failed to submit feedback.");
        }
        return;
      }

      toast.success("Feedback submitted! Thank you.");
      onSuccess(data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title <span className="text-[var(--error)]">*</span></Label>
        <Input
          id="title"
          name="title"
          placeholder="Short, descriptive title"
          required
          minLength={5}
          maxLength={150}
          error={errors.title}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="More detail about your feedback (optional)"
          rows={3}
          maxLength={2000}
          error={errors.description}
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <Select name="categoryId" defaultValue="none">
            <SelectTrigger>
              <SelectValue placeholder="Select category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="authorEmail">Email <span className="text-[var(--error)]">*</span></Label>
          <Input
            id="authorEmail"
            name="authorEmail"
            type="email"
            placeholder="you@example.com"
            required
            error={errors.authorEmail}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="authorName">Name</Label>
          <Input
            id="authorName"
            name="authorName"
            placeholder="Your name (optional)"
            maxLength={100}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Submit feedback"}
        </Button>
      </div>
    </form>
  );
}
