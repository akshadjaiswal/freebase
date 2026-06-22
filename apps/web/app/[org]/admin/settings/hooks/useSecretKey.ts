import { useState } from "react";
import type { OrgSettings } from "./types";

export function useSecretKey(orgSlug: string, setOrg: React.Dispatch<React.SetStateAction<OrgSettings>>) {
  const [showSecret, setShowSecret] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function regenerateSecret() {
    setRegenerating(true);
    const res = await fetch(`/api/v1/orgs/${orgSlug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateSecret: true }),
    });
    setRegenerating(false);
    if (res.ok) {
      const data = await res.json();
      setOrg(data);
    }
  }

  return { showSecret, setShowSecret, regenerating, regenerateSecret };
}
