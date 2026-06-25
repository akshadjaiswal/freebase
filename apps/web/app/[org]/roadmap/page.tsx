import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/layout/page-hero";
import { KanbanColumn } from "@/components/roadmap/kanban-column";
import { getOrgBySlug, getPublicRoadmapPageData } from "@/lib/data";

interface Props {
  params: Promise<{ org: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { org: orgSlug } = await params;
  const org = await getOrgBySlug(orgSlug);
  if (!org) return {};
  return { title: `${org.name} — Roadmap` };
}

export default async function RoadmapPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const org = await getOrgBySlug(orgSlug);
  if (!org) notFound();

  const items = await getPublicRoadmapPageData(org.id);

  const format = (item: typeof items[number]) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    position: item.position,
    visible: item.visible,
    feedbackPostId: item.feedbackPostId,
    votes: item.feedbackPost?.voteCount ?? 0,
  });

  const planned = items.filter((i) => i.status === "planned").map(format);
  const inProgress = items.filter((i) => i.status === "in-progress").map(format);
  const done = items.filter((i) => i.status === "done").map(format);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Topbar orgSlug={orgSlug} orgName={org.name} logoUrl={org.logoUrl} accentColor={org.accentColor} wide />
      <PageHero
        orgName={org.name}
        accentColor={org.accentColor}
        subtitle="What we're working on and what's planned next."
        wide
      />

      <div className="px-4 py-8">
        {/* Three-column kanban — horizontal scroll + snap on mobile */}
        <div className="mx-auto max-w-5xl overflow-x-auto">
          <div className="flex gap-5 min-w-[860px] snap-x snap-mandatory md:snap-none">
            <KanbanColumn
              title="Planned"
              items={planned}
              orgSlug={orgSlug}
              emptyText="Nothing planned yet"
            />
            <KanbanColumn
              title="In Progress"
              items={inProgress}
              orgSlug={orgSlug}
              emptyText="Nothing in progress"
            />
            <KanbanColumn
              title="Done"
              items={done}
              orgSlug={orgSlug}
              emptyText="Nothing shipped yet"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
