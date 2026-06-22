"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ConfirmAction } from "../hooks/types";

interface ConfirmActionDialogProps {
  action: ConfirmAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const TITLES: Record<ConfirmAction["type"], string> = {
  "regen-secret": "Regenerate secret key",
  "delete-key": "Delete API key",
  "delete-webhook": "Delete webhook",
};

const DESCRIPTIONS: Record<ConfirmAction["type"], string> = {
  "regen-secret": "All existing widget JWTs will be invalidated immediately. Any identified widget users will need to re-authenticate.",
  "delete-key": "Any integrations using this key will stop working immediately. This cannot be undone.",
  "delete-webhook": "This webhook will stop receiving events. This cannot be undone.",
};

export function ConfirmActionDialog({ action, onConfirm, onCancel }: ConfirmActionDialogProps) {
  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{action ? TITLES[action.type] : ""}</DialogTitle>
          <DialogDescription>{action ? DESCRIPTIONS[action.type] : ""}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            {action?.type === "regen-secret" ? "Regenerate" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
