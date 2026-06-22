"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, EyeOff, Plus, Trash2, Check, Globe, Key, Webhook, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

interface OrgSettings {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  secretKey: string;
}

interface Props {
  org: OrgSettings;
  apiKeys: ApiKeyItem[];
  webhooks: WebhookItem[];
  emailEnabled: boolean;
}

const ALL_EVENTS = [
  "post.created",
  "post.updated",
  "post.status_changed",
  "post.deleted",
  "comment.created",
  "changelog.published",
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-1.5 rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[var(--accent)]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-[var(--text-muted)]" />
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
    </div>
  );
}

export function SettingsClient({ org: initialOrg, apiKeys: initialKeys, webhooks: initialWebhooks, emailEnabled }: Props) {
  const router = useRouter();
  const [org, setOrg] = useState(initialOrg);
  const [apiKeys, setApiKeys] = useState(initialKeys);
  const [webhooks, setWebhooks] = useState(initialWebhooks);

  // Org name + accent color editing
  const [orgName, setOrgName] = useState(org.name);
  const [accentColor, setAccentColor] = useState(org.accentColor);
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Secret key visibility
  const [showSecret, setShowSecret] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // API key creation
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Confirm dialog
  type ConfirmAction = { type: "regen-secret" } | { type: "delete-key"; id: string } | { type: "delete-webhook"; id: string };
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  // Webhook creation
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [whUrl, setWhUrl] = useState("");
  const [whSecret, setWhSecret] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>([]);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [whError, setWhError] = useState("");

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

  async function regenerateSecret() {
    setRegenerating(true);
    const res = await fetch(`/api/v1/orgs/${org.slug}/settings`, {
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

  async function createApiKey() {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    const res = await fetch(`/api/v1/orgs/${org.slug}/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    setCreatingKey(false);
    if (res.ok) {
      const data = await res.json();
      setCreatedKey(data.key);
      setApiKeys((prev) => [{ id: data.id, name: data.name, keyPrefix: data.keyPrefix, lastUsedAt: null, createdAt: data.createdAt }, ...prev]);
      setNewKeyName("");
    }
  }

  async function deleteApiKey(id: string) {
    const res = await fetch(`/api/v1/orgs/${org.slug}/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) setApiKeys((prev) => prev.filter((k) => k.id !== id));
  }

  async function createWebhook() {
    setWhError("");
    if (!whUrl || !whSecret || whEvents.length === 0) {
      setWhError("URL, secret, and at least one event are required.");
      return;
    }
    setCreatingWebhook(true);
    const res = await fetch(`/api/v1/orgs/${org.slug}/webhooks`, {
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
    const res = await fetch(`/api/v1/orgs/${org.slug}/webhooks/${id}`, { method: "DELETE" });
    if (res.ok) setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

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

  async function toggleWebhook(id: string, active: boolean) {
    const res = await fetch(`/api/v1/orgs/${org.slug}/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) {
      setWebhooks((prev) => prev.map((w) => w.id === id ? { ...w, active } : w));
    }
  }

  return (
    <div className="p-8 max-w-2xl space-y-10">
      {/* Org settings */}
      <section>
        <SectionHeader icon={Globe} title="Organization" />
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
          <div className="p-4 flex items-end gap-3">
            <div className="flex-1">
              <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Organization name</Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveOrgSettings()}
              />
            </div>
            <Button size="sm" onClick={saveOrgSettings} disabled={savingOrg || (orgName === org.name && accentColor === org.accentColor)}>
              {orgSaved ? <Check className="h-3.5 w-3.5" /> : "Save"}
            </Button>
          </div>
          <div className="p-4">
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Org slug (URL)</Label>
            <code className="block rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--text-muted)] font-mono">
              {org.slug}
            </code>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">Slug cannot be changed after creation.</p>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Accent color</Label>
              <p className="text-xs text-[var(--text-muted)]">Used on public pages and the embedded widget.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-transparent p-0.5"
              />
              <code className="text-xs font-mono text-[var(--text-muted)]">{accentColor}</code>
            </div>
          </div>
        </div>
      </section>

      {/* Widget secret key */}
      <section>
        <SectionHeader icon={Key} title="Widget Secret Key" />
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">
            Use this key to sign <code className="text-[var(--accent)]">window.Freebase(&apos;identify&apos;, &#123; jwt &#125;)</code> calls on your backend. Keep it secret.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-mono text-[var(--text-muted)] truncate">
              {showSecret ? org.secretKey : "•".repeat(40)}
            </code>
            <button
              onClick={() => setShowSecret((v) => !v)}
              className="rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            {showSecret && <CopyButton text={org.secretKey} />}
          </div>
          <Button variant="outline" size="sm" onClick={() => setConfirmAction({ type: "regen-secret" })} disabled={regenerating}>
            {regenerating ? "Regenerating…" : "Regenerate secret"}
          </Button>
        </div>
      </section>

      {/* API Keys */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">API Keys</h2>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowCreateKey(true)}>
            <Plus className="h-3.5 w-3.5" />
            New key
          </Button>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
          {apiKeys.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">No API keys yet.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{key.name}</p>
                    <p className="text-xs text-[var(--text-muted)] font-mono">{key.keyPrefix}…</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {key.lastUsedAt
                      ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                      : "Never used"}
                  </span>
                  <button
                    onClick={() => setConfirmAction({ type: "delete-key", id: key.id })}
                    className="rounded p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Webhooks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Webhooks</h2>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowCreateWebhook(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add webhook
          </Button>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
          {webhooks.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">No webhooks yet.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {webhooks.map((wh) => (
                <div key={wh.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-[var(--text-primary)] truncate">{wh.url}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {wh.events.map((e) => (
                        <Badge key={e} variant="default" className="text-[10px] px-1.5 py-0">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleWebhook(wh.id, !wh.active)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        wh.active
                          ? "border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent-subtle)]"
                          : "border-[var(--border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {wh.active ? "Active" : "Paused"}
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: "delete-webhook", id: wh.id })}
                      className="rounded p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Email */}
      <section>
        <SectionHeader icon={Mail} title="Email Subscriptions" />
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 flex items-start gap-3">
          <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${emailEnabled ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]"}`} />
          <div>
            {emailEnabled ? (
              <>
                <p className="text-sm font-medium text-[var(--text-primary)]">Email enabled</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Changelog subscriptions active. Emails send from <code className="text-[var(--accent)]">{process.env.NEXT_PUBLIC_APP_URL ? "your verified domain" : "your domain"}</code>.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[var(--text-primary)]">Email disabled</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Set <code className="text-[var(--accent)]">RESEND_API_KEY</code> and <code className="text-[var(--accent)]">EMAIL_FROM_DOMAIN</code> environment variables to enable changelog email subscriptions.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="rounded-[var(--radius-md)] border border-red-500/20 bg-[var(--surface)] p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Delete organization</p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Permanently deletes all feedback posts, changelog entries, roadmap items, API keys, and webhooks. This cannot be undone.
            </p>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">
              Type <code className="text-red-400">{org.slug}</code> to confirm
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder={org.slug}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={deleteOrg}
                disabled={deleteConfirm !== org.slug || deleting}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Confirm action dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "regen-secret" && "Regenerate secret key"}
              {confirmAction?.type === "delete-key" && "Delete API key"}
              {confirmAction?.type === "delete-webhook" && "Delete webhook"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "regen-secret" && "All existing widget JWTs will be invalidated immediately. Any identified widget users will need to re-authenticate."}
              {confirmAction?.type === "delete-key" && "Any integrations using this key will stop working immediately. This cannot be undone."}
              {confirmAction?.type === "delete-webhook" && "This webhook will stop receiving events. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmAction}>
              {confirmAction?.type === "regen-secret" ? "Regenerate" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Key dialog */}
      <Dialog open={showCreateKey} onOpenChange={(open) => { if (!open) { setShowCreateKey(false); setCreatedKey(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
          </DialogHeader>
          {createdKey ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                Copy your key now — it will not be shown again.
              </p>
              <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--accent)]/40 bg-[var(--accent-subtle)] px-3 py-2">
                <code className="flex-1 text-xs font-mono text-[var(--accent)] break-all">{createdKey}</code>
                <CopyButton text={createdKey} />
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreateKey(false); setCreatedKey(null); }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 block text-xs text-[var(--text-secondary)]">Key name</Label>
                <Input
                  placeholder="e.g. Production"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createApiKey()}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateKey(false)}>Cancel</Button>
                <Button onClick={createApiKey} disabled={creatingKey || !newKeyName.trim()}>
                  {creatingKey ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Webhook dialog */}
      <Dialog open={showCreateWebhook} onOpenChange={setShowCreateWebhook}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add webhook</DialogTitle>
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
              <Button variant="outline" onClick={() => setShowCreateWebhook(false)}>Cancel</Button>
              <Button onClick={createWebhook} disabled={creatingWebhook}>
                {creatingWebhook ? "Adding…" : "Add webhook"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
