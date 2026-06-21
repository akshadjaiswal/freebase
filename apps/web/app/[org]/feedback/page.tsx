import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/topbar";
import { FeedbackBoard } from "./feedback-board";
import { ThemeProvider } from "next-themes";
import { getOrgBySlug, getPublicFeedbackPageData } from "@/lib/data";

interface Props {
  params: Promise<{ org: string }>;
  searchParams: Promise<{
    status?: string;
    sort?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { org: orgSlug } = await params;
  const org = await getOrgBySlug(orgSlug);
  if (!org) return {};
  return { title: `${org.name} — Feedback` };
}

export default async function FeedbackPage({ params, searchParams }: Props) {
  const { org: orgSlug } = await params;
  const sp = await searchParams;

  const org = await getOrgBySlug(orgSlug);
  if (!org) notFound();

  const { categories } = await getPublicFeedbackPageData(org.id);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-[var(--background)]">
        <Topbar orgSlug={orgSlug} orgName={org.name} logoUrl={org.logoUrl} />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Suspense fallback={<FeedbackBoardSkeleton />}>
            <FeedbackBoard
              orgSlug={orgSlug}
              orgId={org.id}
              categories={categories}
              initialStatus={sp.status}
              initialSort={sp.sort}
              initialQuery={sp.q}
            />
          </Suspense>
        </main>
      </div>
    </ThemeProvider>
  );
}

function FeedbackBoardSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface)]" />
      ))}
    </div>
  );
}
