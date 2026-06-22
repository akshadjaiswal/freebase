import { useState } from "react";
import type { WebhookItem } from "./types";

export function useWebhooks(orgSlug: string, initialWebhooks: WebhookItem[]) {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [whUrl, setWhUrl] = useState("");
  const [whSecret, setWhSecret] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>([]);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [whError, setWhError] = useState("");

  async function createWebhook() {
    setWhError("");
    if (!whUrl || !whSecret || whEvents.length === 0) {
      setWhError("URL, secret, and at least one event are required.");
      return;
    }
    setCreatingWebhook(true);
    const res = await fetch(`/api/v1/orgs/${orgSlug}/webhooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: whUrl, secret: whSecret, events: whEvents }),
    });
    setCreatingWebhook(false);
    if (res.ok) {
      const data = await res.json();
      setWebhooks((prev) => [data, ...prev]);
      setShowCreateWebhook(false);
      setWhUrl("");
      setWhSecret("");
      setWhEvents([]);
    } else {
      const err = await res.json().catch(() => null);
      setWhError(err?.detail ?? "Failed to create webhook.");
    }
  }

  async function deleteWebhook(id: string) {
    const res = await fetch(`/api/v1/orgs/${orgSlug}/webhooks/${id}`, { method: "DELETE" });
    if (res.ok) setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  async function toggleWebhook(id: string, active: boolean) {
    const res = await fetch(`/api/v1/orgs/${orgSlug}/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, active } : w)));
  }

  return {
    webhooks,
    showCreateWebhook, setShowCreateWebhook,
    whUrl, setWhUrl,
    whSecret, setWhSecret,
    whEvents, setWhEvents,
    creatingWebhook,
    whError,
    createWebhook,
    deleteWebhook,
    toggleWebhook,
  };
}
