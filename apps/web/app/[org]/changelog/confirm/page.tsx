import { prisma } from "@/lib/prisma";
import { makeChangelogConfirmToken } from "@/lib/jwt";
import Link from "next/link";

interface Props {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function ChangelogConfirmPage({ params, searchParams }: Props) {
  const { org: orgSlug } = await params;
  const { email, token } = await searchParams;

  if (!email || !token) {
    return <ConfirmResult orgSlug={orgSlug} success={false} message="Invalid confirmation link." />;
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) {
    return <ConfirmResult orgSlug={orgSlug} success={false} message="Organization not found." />;
  }

  const expected = makeChangelogConfirmToken(email, org.secretKey);
  if (token !== expected) {
    return <ConfirmResult orgSlug={orgSlug} success={false} message="Invalid or expired confirmation token." />;
  }

  const subscriber = await prisma.changelogSubscriber.findUnique({
    where: { orgId_email: { orgId: org.id, email } },
  });

  if (!subscriber) {
    return <ConfirmResult orgSlug={orgSlug} success={false} message="Subscription not found. Please subscribe again." />;
  }

  if (!subscriber.confirmed) {
    await prisma.changelogSubscriber.update({
      where: { id: subscriber.id },
      data: { confirmed: true },
    });
  }

  return <ConfirmResult orgSlug={orgSlug} success={true} message={`You're subscribed! You'll receive changelog updates for ${org.name}.`} />;
}

function ConfirmResult({ orgSlug, success, message }: { orgSlug: string; success: boolean; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-sm text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${success ? "bg-[var(--accent-subtle)]" : "bg-red-500/10"}`}>
          {success ? (
            <span className="text-xl text-[var(--accent)]">✓</span>
          ) : (
            <span className="text-xl text-red-400">✕</span>
          )}
        </div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {success ? "Subscription confirmed!" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
        <Link
          href={`/${orgSlug}/changelog`}
          className="mt-6 inline-flex rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          View changelog
        </Link>
      </div>
    </div>
  );
}
