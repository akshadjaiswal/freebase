"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Signing secret</Label>
            <Input
              type="password"
              placeholder="Min 8 characters"
              value={whSecret}
              onChange={(e) => setWhSecret(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Events</Label>
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
