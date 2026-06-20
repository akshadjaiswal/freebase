import { redirect } from "next/navigation";
import { verifyAdminAccess } from "@/lib/auth";
import { getSettingsPageData } from "@/lib/data";
import { SettingsClient } from "./settings-client";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function AdminSettingsPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const session = await verifyAdminAccess(orgSlug);
  if (!session) redirect(`/login?org=${orgSlug}`);

  const { apiKeys, webhooks } = await getSettingsPageData(session.org.id);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Manage <span className="text-[var(--text-primary)]">{session.org.name}</span>
        </p>
      </div>

      <SettingsClient
        org={{
          id: session.org.id,
          name: session.org.name,
          slug: session.org.slug,
          accentColor: session.org.accentColor,
          secretKey: session.org.secretKey,
        }}
        apiKeys={apiKeys.map((k) => ({
          ...k,
          lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt).toISOString() : null,
          createdAt: new Date(k.createdAt).toISOString(),
        }))}
        webhooks={webhooks.map((w) => ({
          ...w,
          createdAt: new Date(w.createdAt).toISOString(),
        }))}
        emailEnabled={!!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM_DOMAIN)}
      />
    </div>
  );
}
