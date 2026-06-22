import { useState } from "react";
import { toast } from "sonner";
import type { Post, Comment } from "./types";

export function useDetailModal(
  orgSlug: string,
  updatePostLocally: (postId: string, patch: Partial<Post>) => void,
) {
  const [detailPost, setDetailPost] = useState<Post | null>(null);
  const [detailComments, setDetailComments] = useState<Comment[]>([]);
  const [detailCommentsLoading, setDetailCommentsLoading] = useState(false);
  const [detailCommentBody, setDetailCommentBody] = useState("");
  const [detailCommentEmail, setDetailCommentEmail] = useState("");
  const [detailCommentSubmitting, setDetailCommentSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  async function openDetail(post: Post) {
    setDetailPost(post);
    setDetailComments([]);
    setDetailCommentsLoading(true);
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${post.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setDetailComments(data.data);
      }
    } catch {
      // silently fail — comments are supplementary
    } finally {
      setDetailCommentsLoading(false);
    }
  }

  function closeDetail() {
    setDetailPost(null);
    setDetailComments([]);
    setDetailCommentBody("");
    setDetailCommentEmail("");
  }

  async function handleDetailCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detailPost || !detailCommentBody.trim() || !detailCommentEmail.trim()) return;
    setDetailCommentSubmitting(true);
    try {
      const res = await fetch(`/api/v1/orgs/${orgSlug}/posts/${detailPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: detailCommentBody, authorEmail: detailCommentEmail }),
      });
      if (!res.ok) { toast.error("Failed to post comment."); return; }
      const newComment = await res.json();
      setDetailComments((prev) => [...prev, newComment]);
      updatePostLocally(detailPost.id, { commentCount: detailPost.commentCount + 1 });
      setDetailCommentBody("");
      toast.success("Comment posted.");
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setDetailCommentSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!detailPost) return;
    setDeletingCommentId(null);
    setDetailComments((prev) => prev.filter((c) => c.id !== commentId));
    updatePostLocally(detailPost.id, { commentCount: Math.max(0, detailPost.commentCount - 1) });
    try {
      const res = await fetch(
        `/api/v1/orgs/${orgSlug}/posts/${detailPost.id}/comments/${commentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) toast.error("Failed to delete comment.");
    } catch {
      toast.error("Failed to delete comment.");
    }
  }

  return {
    detailPost,
    setDetailPost,
    detailComments,
    detailCommentsLoading,
    detailCommentBody,
    setDetailCommentBody,
    detailCommentEmail,
    setDetailCommentEmail,
    detailCommentSubmitting,
    deletingCommentId,
    setDeletingCommentId,
    openDetail,
    closeDetail,
    handleDetailCommentSubmit,
    handleDeleteComment,
  };
}
