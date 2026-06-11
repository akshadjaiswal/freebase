interface Props {
  params: Promise<{ org: string }>;
}

export default async function AdminSettingsPage({ params }: Props) {
  const { org } = await params;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Configure <span className="text-[var(--text-primary)]">{org}</span>
        </p>
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Org settings, API keys, and webhooks coming in Phase 6
        </p>
      </div>
    </div>
  );
}
