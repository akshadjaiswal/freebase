import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgSettings } from "./types";

export function useOrgSettings(initialOrg: OrgSettings) {
  const router = useRouter();
  const [org, setOrg] = useState(initialOrg);
  const [orgName, setOrgName] = useState(initialOrg.name);
  const [accentColor, setAccentColor] = useState(initialOrg.accentColor);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function saveOrgSettings() {
    const updates: Record<string, string> = {};
    if (orgName.trim() && orgName !== org.name) updates.name = orgName.trim();
    if (accentColor !== org.accentColor) updates.accentColor = accentColor;
    if (Object.keys(updates).length === 0) return;
    setSavingOrg(true);
    const res = await fetch(`/api/v1/orgs/${org.slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSavingOrg(false);
    if (res.ok) {
      const data = await res.json();
      setOrg(data);
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 2000);
    }
  }

  async function deleteOrg() {
    if (deleteConfirm !== org.slug) return;
    setDeleting(true);
    const res = await fetch(`/api/v1/orgs/${org.slug}/settings`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      setDeleting(false);
    }
  }

  return {
    org, setOrg,
    orgName, setOrgName,
    accentColor, setAccentColor,
    savingOrg, orgSaved,
    deleteConfirm, setDeleteConfirm,
    deleting,
    saveOrgSettings,
    deleteOrg,
  };
}
