import { useState } from "react";
import { toast } from "sonner";
import type { Post, StatusValue, Category } from "./types";

export function useFeedbackPosts(orgSlug: string, initialPosts: Post[], initialCategories: Category[]) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<"all" | StatusValue>("all");

  const filteredPosts = activeTab === "all" ? posts : posts.filter((p) => p.status === activeTab);

  async function handleStatusChange(postId: string, newStatus: StatusValue) {
    const prev = posts.find((p) => p.id === postId);
    if (!prev || prev.status === newStatus) return;

    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, status: newStatus } : p)));

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, status: prev.status } : p)));
        toast.error("Failed to update status.");
      }
    } catch {
      setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, status: prev.status } : p)));
      toast.error("Failed to update status.");
    }
  }

  async function handlePin(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const newPinned = !post.pinned;

    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, pinned: newPinned } : p)));

    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: newPinned }),
      });
      if (!res.ok) {
        setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, pinned: post.pinned } : p)));
        toast.error("Failed to update pin.");
      } else {
        toast.success(newPinned ? "Post pinned." : "Post unpinned.");
      }
    } catch {
      setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, pinned: post.pinned } : p)));
      toast.error("Failed to update pin.");
    }
  }

  async function handleDelete(postId: string) {
    setPosts((ps) => ps.filter((p) => p.id !== postId));
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) toast.error("Failed to delete post.");
      else toast.success("Post deleted.");
    } catch {
      toast.error("Failed to delete post.");
    }
  }

  function updatePostLocally(postId: string, patch: Partial<Post>) {
    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, ...patch } : p)));
  }

  return {
    posts,
    setPosts,
    categories,
    setCategories,
    activeTab,
    setActiveTab,
    filteredPosts,
    handleStatusChange,
    handlePin,
    handleDelete,
    updatePostLocally,
  };
}
