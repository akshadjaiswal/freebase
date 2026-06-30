"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import { FieldInfo } from "@/components/ui/field-info";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  newKeyName: string;
  setNewKeyName: (v: string) => void;
  creatingKey: boolean;
  createdKey: string | null;
  onCreate: () => void;
}

export function CreateApiKeyDialog({ open, onClose, newKeyName, setNewKeyName, creatingKey, createdKey, onCreate }: CreateApiKeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>Give the key a name to identify it later.</DialogDescription>
        </DialogHeader>
        {createdKey ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">Copy your key now. It will not be shown again.</p>
            <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--accent)]/40 bg-[var(--accent-subtle)] px-3 py-2">
              <code className="flex-1 text-xs font-mono text-[var(--accent)] break-all">{createdKey}</code>
              <CopyButton text={createdKey} />
            </div>
            <DialogFooter>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                Key name
                <FieldInfo text="A label so you can identify and rotate keys later. e.g. 'Production backend' or 'GitHub Actions'." />
              </Label>
              <Input
                placeholder="e.g. Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCreate()}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={onCreate} disabled={creatingKey || !newKeyName.trim()}>
                {creatingKey ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
