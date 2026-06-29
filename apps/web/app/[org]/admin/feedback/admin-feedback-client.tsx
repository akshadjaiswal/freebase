"use client";

import { Tag, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import { useFeedbackPosts } from "./hooks/useFeedbackPosts";
import { useMultiSelect } from "./hooks/useMultiSelect";
import { useDeleteConfirmation } from "./hooks/useDeleteConfirmation";
import { useBulkActions } from "./hooks/useBulkActions";
import { useDetailModal } from "./hooks/useDetailModal";
import { useCategoryManagement } from "./hooks/useCategoryManagement";

import { BulkActionsBar } from "./components/BulkActionsBar";
import { FeedbackTableRow } from "./components/FeedbackTableRow";
import { PostDetailModal } from "./components/PostDetailModal";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { CategoryManagementDialog } from "./components/CategoryManagementDialog";

import { STATUS_FILTER_TABS, type Post, type Category, type StatusValue } from "./hooks/types";

interface AdminFeedbackClientProps {
  orgSlug: string;
  initialPosts: Post[];
  initialCategories: Category[];
}

export function AdminFeedbackClient({ orgSlug, initialPosts, initialCategories }: AdminFeedbackClientProps) {
  const {
    posts, setPosts, categories, setCategories,
    activeTab, setActiveTab, filteredPosts,
    handleStatusChange, handlePin, handleDelete, updatePostLocally,
  } = useFeedbackPosts(orgSlug, initialPosts, initialCategories);

  const { selectedIds, toggleSelect, toggleSelectAll, clearSelection } = useMultiSelect(filteredPosts);
  const postDelete = useDeleteConfirmation();
  const { bulkStatus, setBulkStatus, bulkLoading, handleBulkStatusChange } = useBulkActions(
    orgSlug, selectedIds, posts, setPosts, clearSelection
  );
  const {
    detailPost, setDetailPost, detailComments, detailCommentsLoading,
    detailCommentBody, setDetailCommentBody, detailCommentEmail, setDetailCommentEmail,
    detailCommentSubmitting, deletingCommentId, setDeletingCommentId,
    openDetail, closeDetail, handleDetailCommentSubmit, handleDeleteComment,
  } = useDetailModal(orgSlug, updatePostLocally);
  const catMgmt = useCategoryManagement(orgSlug, setCategories);

  function handleCategoryChange(postId: string, catId: string | null, cat: Category | null) {
    setDetailPost((p) => p ? { ...p, category: cat } : p);
    updatePostLocally(postId, { category: cat });
    fetch(`/api/v1/orgs/${orgSlug}/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: catId }),
    });
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Feedback</h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{posts.length} total posts</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => catMgmt.setCatDialogOpen(true)}>
          <Tag className="h-3.5 w-3.5" />
          Manage categories
        </Button>
      </div>

      {/* Status tabs */}
      <div className="mb-4 flex gap-1">
        {STATUS_FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-[var(--radius)] px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              activeTab === tab
                ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab === "in-progress" ? "In Progress" : tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          count={selectedIds.size}
          bulkStatus={bulkStatus}
          bulkLoading={bulkLoading}
          onStatusChange={(s: StatusValue) => setBulkStatus(s)}
          onApply={handleBulkStatusChange}
          onClear={clearSelection}
        />
      )}

      {/* Table */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border)]">
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
            onChange={toggleSelectAll}
            className="h-3.5 w-3.5 accent-[var(--accent)]"
            aria-label="Select all"
          />
          <span className="flex-1">Title</span>
          <span className="w-24 text-center">Status</span>
          <span className="w-14 text-center">Votes</span>
          <span className="w-14 text-center">Comments</span>
          <span className="w-28">Date</span>
          <span className="w-8" />
        </div>

        {filteredPosts.length === 0 ? (
          posts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <MessageSquarePlus className="h-8 w-8 text-[var(--text-muted)] opacity-40" />
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">No feedback yet</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Share your feedback URL or embed the widget to start collecting.
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                <a
                  href={`/${orgSlug}/feedback`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded px-3 py-1.5 text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  View feedback page
                </a>
                <a
                  href={`/${orgSlug}/admin/settings`}
                  className="rounded px-3 py-1.5 text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)] hover:opacity-80 transition-opacity"
                >
                  Widget setup
                </a>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
              No posts match this filter.
            </div>
          )
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredPosts.map((post) => (
              <FeedbackTableRow
                key={post.id}
                post={post}
                isSelected={selectedIds.has(post.id)}
                onToggle={toggleSelect}
                onStatusChange={handleStatusChange}
                onPin={handlePin}
                onDelete={(id) => postDelete.requestDelete(id)}
                onViewDetail={openDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PostDetailModal
        post={detailPost}
        categories={categories}
        comments={detailComments}
        commentsLoading={detailCommentsLoading}
        commentBody={detailCommentBody}
        setCommentBody={setDetailCommentBody}
        commentEmail={detailCommentEmail}
        setCommentEmail={setDetailCommentEmail}
        commentSubmitting={detailCommentSubmitting}
        deletingCommentId={deletingCommentId}
        setDeletingCommentId={setDeletingCommentId}
        onClose={closeDetail}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
        onCommentSubmit={handleDetailCommentSubmit}
        onDeleteComment={handleDeleteComment}
        setDetailPost={setDetailPost}
      />

      <DeleteConfirmDialog
        open={!!postDelete.confirmingId}
        title="Delete post"
        description="This will permanently delete the post and all its votes and comments. This cannot be undone."
        onConfirm={() => postDelete.confirmingId && handleDelete(postDelete.confirmingId)}
        onCancel={postDelete.cancelDelete}
      />

      <CategoryManagementDialog
        open={catMgmt.catDialogOpen}
        onOpenChange={catMgmt.setCatDialogOpen}
        categories={categories}
        newCatName={catMgmt.newCatName}
        setNewCatName={catMgmt.setNewCatName}
        newCatColor={catMgmt.newCatColor}
        setNewCatColor={catMgmt.setNewCatColor}
        catLoading={catMgmt.catLoading}
        deletingCatId={catMgmt.deletingCatId}
        setDeletingCatId={catMgmt.setDeletingCatId}
        onAddCategory={catMgmt.handleAddCategory}
        onDeleteCategory={catMgmt.handleDeleteCategory}
      />
    </div>
  );
}
