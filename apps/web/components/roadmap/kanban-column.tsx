import { RoadmapCard, type RoadmapItem } from "./roadmap-card";

interface KanbanColumnProps {
  title: string;
  items: RoadmapItem[];
  emptyText?: string;
  /** Org slug — passed to cards for feedback link */
  orgSlug?: string;
  admin?: boolean;
  onToggleVisible?: (id: string, visible: boolean) => void;
  onDelete?: (id: string) => void;
}

export function KanbanColumn({
  title,
  items,
  emptyText = "No items",
  orgSlug,
  admin,
  onToggleVisible,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex min-w-[280px] w-[85vw] md:w-auto flex-shrink-0 flex-1 flex-col snap-start">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">{title}</h3>
        <span className="rounded-full bg-[var(--surface-raised)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-4 py-6 text-center">
            <p className="text-xs text-[var(--text-muted)]">{emptyText}</p>
          </div>
        )}
        {items.map((item) => (
          <RoadmapCard
            key={item.id}
            item={item}
            orgSlug={orgSlug}
            admin={admin}
            onToggleVisible={onToggleVisible}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
