import { useState } from "react";

export function useDeleteConfirmation() {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function requestDelete(id: string) {
    setConfirmingId(id);
  }

  function cancelDelete() {
    setConfirmingId(null);
  }

  function clearConfirm() {
    setConfirmingId(null);
  }

  return { confirmingId, requestDelete, cancelDelete, clearConfirm };
}
