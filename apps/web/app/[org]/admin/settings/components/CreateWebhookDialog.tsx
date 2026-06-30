"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldInfo } from "@/components/ui/field-info";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ALL_EVENTS } from "../hooks/types";

interface CreateWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whUrl: string;
  setWhUrl: (v: string) => void;
  whSecret: string;
  setWhSecret: (v: string) => void;
  whEvents: string[];
  setWhEvents: (events: string[] | ((prev: string[]) => string[])) => void;
  creatingWebhook: boolean;
  whError: string;
  onCreate: () => void;
}

export function CreateWebhookDialog({
  open, onOpenChange, whUrl, setWhUrl, whSecret, setWhSecret,
  whEvents, setWhEvents, creatingWebhook, whError, onCreate,
}: CreateWebhookDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add webhook</DialogTitle>
          <DialogDescription>Receive signed HTTP POST events from Freebase.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Endpoint URL</Label>
            <Input
              placeholder="https://yourapp.com/webhooks/freebase"
              value={whUrl}
              onChange={(e) => setWhUrl(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              Signing secret
              <FieldInfo text="Your server verifies X-Freebase-Signature: sha256=HMAC(SHA256(secret), timestamp.body) to confirm the payload is from Freebase. Min 8 characters." />
            </Label>
            <Input
              type="password"
              placeholder="Min 8 characters"
              value={whSecret}
              onChange={(e) => setWhSecret(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              Events
              <FieldInfo text="post.created: new feedback submitted. post.status_changed: admin updates status. comment.created: new comment. changelog.published: entry goes live." />
            </Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {ALL_EVENTS.map((event) => (
                <label key={event} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whEvents.includes(event)}
                    onChange={(e) =>
                      setWhEvents((prev) =>
                        e.target.checked ? [...prev, event] : prev.filter((ev) => ev !== event)
                      )
                    }
                    className="accent-[var(--accent)] h-3.5 w-3.5"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">{event}</span>
                </label>
              ))}
            </div>
          </div>
          {whError && <p className="text-xs text-red-400">{whError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onCreate} disabled={creatingWebhook}>
              {creatingWebhook ? "Adding…" : "Add webhook"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
