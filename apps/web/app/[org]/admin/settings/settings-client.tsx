"use client";

import { Mail } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";

import { useOrgSettings } from "./hooks/useOrgSettings";
import { useSecretKey } from "./hooks/useSecretKey";
import { useApiKeys } from "./hooks/useApiKeys";
import { useWebhooks } from "./hooks/useWebhooks";
import { useConfirmDialog } from "./hooks/useConfirmDialog";

import { OrganizationSection } from "./components/OrganizationSection";
import { SecretKeySection } from "./components/SecretKeySection";
import { ApiKeysList } from "./components/ApiKeysList";
import { WebhooksList } from "./components/WebhooksList";
import { DangerZoneSection } from "./components/DangerZoneSection";
import { ConfirmActionDialog } from "./components/ConfirmActionDialog";
import { CreateApiKeyDialog } from "./components/CreateApiKeyDialog";
import { CreateWebhookDialog } from "./components/CreateWebhookDialog";

import type { OrgSettings, ApiKeyItem, WebhookItem } from "./hooks/types";

interface Props {
  org: OrgSettings;
  apiKeys: ApiKeyItem[];
  webhooks: WebhookItem[];
  emailEnabled: boolean;
}

export function SettingsClient({ org: initialOrg, apiKeys: initialKeys, webhooks: initialWebhooks, emailEnabled }: Props) {
  const orgSettings = useOrgSettings(initialOrg);
  const secretKey = useSecretKey(orgSettings.org.slug, orgSettings.setOrg);
  const apiKeys = useApiKeys(orgSettings.org.slug, initialKeys);
  const webhooks = useWebhooks(orgSettings.org.slug, initialWebhooks);
  const confirmDialog = useConfirmDialog(secretKey.regenerateSecret, apiKeys.deleteApiKey, webhooks.deleteWebhook);

  return (
    <div className="p-8 max-w-2xl space-y-10">
      <OrganizationSection
        org={orgSettings.org}
        orgName={orgSettings.orgName}
        setOrgName={orgSettings.setOrgName}
        accentColor={orgSettings.accentColor}
        setAccentColor={orgSettings.setAccentColor}
        savingOrg={orgSettings.savingOrg}
        orgSaved={orgSettings.orgSaved}
        onSave={orgSettings.saveOrgSettings}
      />

      <SecretKeySection
        secretKey={orgSettings.org.secretKey}
        showSecret={secretKey.showSecret}
        setShowSecret={secretKey.setShowSecret}
        regenerating={secretKey.regenerating}
        onRequestRegen={confirmDialog.setConfirmAction}
      />

      <ApiKeysList
        apiKeys={apiKeys.apiKeys}
        onNew={() => apiKeys.setShowCreateKey(true)}
        onDelete={confirmDialog.setConfirmAction}
      />

      <WebhooksList
        webhooks={webhooks.webhooks}
        onNew={() => webhooks.setShowCreateWebhook(true)}
        onDelete={confirmDialog.setConfirmAction}
        onToggle={webhooks.toggleWebhook}
      />

      <section>
        <SectionHeader icon={Mail} title="Email Subscriptions" />
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 flex items-start gap-3">
          <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${emailEnabled ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]"}`} />
          <div>
            {emailEnabled ? (
              <>
                <p className="text-sm font-medium text-[var(--text-primary)]">Email enabled</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Changelog subscriptions active. Emails send from your verified domain.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[var(--text-primary)]">Email disabled</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Set <code className="text-[var(--accent)]">RESEND_API_KEY</code> and <code className="text-[var(--accent)]">EMAIL_FROM_DOMAIN</code> to enable changelog email subscriptions.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <DangerZoneSection
        orgSlug={orgSettings.org.slug}
        deleteConfirm={orgSettings.deleteConfirm}
        setDeleteConfirm={orgSettings.setDeleteConfirm}
        deleting={orgSettings.deleting}
        onDelete={orgSettings.deleteOrg}
      />

      <ConfirmActionDialog
        action={confirmDialog.confirmAction}
        onConfirm={confirmDialog.handleConfirmAction}
        onCancel={() => confirmDialog.setConfirmAction(null)}
      />

      <CreateApiKeyDialog
        open={apiKeys.showCreateKey}
        onClose={apiKeys.closeCreateDialog}
        newKeyName={apiKeys.newKeyName}
        setNewKeyName={apiKeys.setNewKeyName}
        creatingKey={apiKeys.creatingKey}
        createdKey={apiKeys.createdKey}
        onCreate={apiKeys.createApiKey}
      />

      <CreateWebhookDialog
        open={webhooks.showCreateWebhook}
        onOpenChange={webhooks.setShowCreateWebhook}
        whUrl={webhooks.whUrl}
        setWhUrl={webhooks.setWhUrl}
        whSecret={webhooks.whSecret}
        setWhSecret={webhooks.setWhSecret}
        whEvents={webhooks.whEvents}
        setWhEvents={webhooks.setWhEvents}
        creatingWebhook={webhooks.creatingWebhook}
        whError={webhooks.whError}
        onCreate={webhooks.createWebhook}
      />
    </div>
  );
}
