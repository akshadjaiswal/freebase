import { useState } from "react";
import type { ApiKeyItem } from "./types";

export function useApiKeys(orgSlug: string, initialKeys: ApiKeyItem[]) {
  const [apiKeys, setApiKeys] = useState(initialKeys);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  async function createApiKey() {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    const res = await fetch(`/api/v1/orgs/${orgSlug}/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    setCreatingKey(false);
    if (res.ok) {
      const data = await res.json();
      setCreatedKey(data.key);
      setApiKeys((prev) => [
        { id: data.id, name: data.name, keyPrefix: data.keyPrefix, lastUsedAt: null, createdAt: data.createdAt },
        ...prev,
      ]);
      setNewKeyName("");
    }
  }

  async function deleteApiKey(id: string) {
    const res = await fetch(`/api/v1/orgs/${orgSlug}/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) setApiKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function closeCreateDialog() {
    setShowCreateKey(false);
    setCreatedKey(null);
    setNewKeyName("");
  }

  return {
    apiKeys,
    showCreateKey, setShowCreateKey,
    newKeyName, setNewKeyName,
    creatingKey,
    createdKey,
    createApiKey,
    deleteApiKey,
    closeCreateDialog,
  };
}
