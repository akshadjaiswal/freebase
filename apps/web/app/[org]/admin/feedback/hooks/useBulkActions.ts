import { useState } from "react";
import { toast } from "sonner";
import type { Post, StatusValue } from "./types";

export function useBulkActions(
  orgSlug: string,
  selectedIds: Set<string>,
  posts: Post[],
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
  clearSelection: () => void,
) {
  const [bulkStatus, setBulkStatus] = useState<StatusValue | "">("");
  const [bulkLoading, setBulkLoading] = useState(false);

  async function handleBulkStatusChange() {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkLoading(true);

    const ids = Array.from(selectedIds);
    const prevStatuses = Object.fromEntries(ids.map((id) => [id, posts.find((p) => p.id === id)?.status]));

    setPosts((ps) => ps.map((p) => (selectedIds.has(p.id) ? { ...p, status: bulkStatus } : p)));

    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/v1/orgs/${orgSlug}/posts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bulkStatus }),
        }).then((r) => ({ id, ok: r.ok }))
      )
    );

    const failedIds = new Set(
      results
        .filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok))
        .map((r) => (r.status === "fulfilled" ? r.value.id : null))
        .filter(Boolean) as string[]
    );

    if (failedIds.size > 0) {
      setPosts((ps) =>
        ps.map((p) =>
          failedIds.has(p.id) && prevStatuses[p.id] ? { ...p, status: prevStatuses[p.id]! } : p
        )
      );
      const succeeded = ids.length - failedIds.size;
      toast.error(`${succeeded} of ${ids.length} updated. ${failedIds.size} failed.`);
    } else {
      toast.success(`Updated ${ids.length} posts to "${bulkStatus}".`);
    }

    clearSelection();
    setBulkStatus("");
    setBulkLoading(false);
  }

  return { bulkStatus, setBulkStatus, bulkLoading, handleBulkStatusChange };
}
