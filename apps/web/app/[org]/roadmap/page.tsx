import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
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
      <Topbar orgSlug={orgSlug} orgName={org.name} logoUrl={org.logoUrl} />

      <div className="px-4 py-8">
        <div className="mb-6 mx-auto max-w-5xl">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Roadmap</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            What we&apos;re working on and what&apos;s planned next.
          </p>
        </div>

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
