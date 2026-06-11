import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function FeedbackPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { name: true },
  });

  if (!org) notFound();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{org.name} — Feedback</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Feedback board coming in Phase 2
        </p>
      </div>
    </div>
  );
}
