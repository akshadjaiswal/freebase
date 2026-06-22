import { useState } from "react";
import type { ConfirmAction } from "./types";

export function useConfirmDialog(
  regenerateSecret: () => Promise<void>,
  deleteApiKey: (id: string) => Promise<void>,
  deleteWebhook: (id: string) => Promise<void>,
) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  async function handleConfirmAction() {
    if (!confirmAction) return;
    setConfirmAction(null);
    if (confirmAction.type === "regen-secret") {
      await regenerateSecret();
    } else if (confirmAction.type === "delete-key") {
      await deleteApiKey(confirmAction.id);
    } else if (confirmAction.type === "delete-webhook") {
      await deleteWebhook(confirmAction.id);
    }
  }

  return { confirmAction, setConfirmAction, handleConfirmAction };
}
