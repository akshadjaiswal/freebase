"use client";

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
}

export function SettingsClient({ org: initialOrg, apiKeys: initialKeys, webhooks: initialWebhooks }: Props) {
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
