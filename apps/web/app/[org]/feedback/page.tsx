import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/layout/page-hero";
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
  const title = `${org.name} — Feedback`;
  const description = `Submit ideas, vote on features, and track what ${org.name} is building.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary" as const, title, description },
  };
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
        <Topbar orgSlug={orgSlug} orgName={org.name} logoUrl={org.logoUrl} accentColor={org.accentColor} />
        <PageHero
          orgName={org.name}
          accentColor={org.accentColor}
          subtitle="Submit ideas, vote on features, and track what we're building."
        />
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
