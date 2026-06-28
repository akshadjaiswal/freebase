"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical } from "lucide-react";
import { RoadmapCard, type RoadmapItem } from "./roadmap-card";
import { AddRoadmapItemModal } from "./add-roadmap-item-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Status = "planned" | "in-progress" | "done";

interface RoadmapData {
  planned: RoadmapItem[];
  inProgress: RoadmapItem[];
  done: RoadmapItem[];
}

interface FeedbackPost {
  id: string;
  title: string;
  voteCount: number;
  status: string;
}

interface Props {
  orgSlug: string;
  initialData: RoadmapData;
  feedbackPosts: FeedbackPost[];
}

const COLUMN_IDS: Record<Status, keyof RoadmapData> = {
  planned: "planned",
  "in-progress": "inProgress",
  done: "done",
};

const COLUMN_LABELS: Record<Status, string> = {
  planned: "Planned",
  "in-progress": "In Progress",
  done: "Done",
};

const STATUS_LIST: Status[] = ["planned", "in-progress", "done"];

function itemToColumn(item: RoadmapItem): keyof RoadmapData {
  if (item.status === "in-progress") return "inProgress";
  if (item.status === "done") return "done";
  return "planned";
}

function statusFromColumn(col: keyof RoadmapData): Status {
  if (col === "inProgress") return "in-progress";
  if (col === "done") return "done";
  return "planned";
}

// Sortable card wrapper — lives here because it needs useSortable (dnd-kit context)
function SortableCard({
  item,
  onToggleVisible,
  onDelete,
}: {
  item: RoadmapItem;
  onToggleVisible: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity p-1"
      >
        <GripVertical className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
      <RoadmapCard
        item={item}
        admin
        isDragging={isDragging}
        onToggleVisible={onToggleVisible}
        onDelete={onDelete}
      />
    </div>
  );
}

// Droppable column — lives here because it needs SortableContext (dnd-kit context)
function AdminColumn({
  colKey,
  status,
  items,
  onToggleVisible,
  onDelete,
}: {
  colKey: keyof RoadmapData;
  status: Status;
  items: RoadmapItem[];
  onToggleVisible: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col" data-column={colKey}>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">
          {COLUMN_LABELS[status]}
        </h3>
        <span className="rounded-full bg-[var(--surface-raised)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
          {items.length}
        </span>
      </div>

      <SortableContext
        id={colKey}
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[80px]">
          {items.length === 0 && (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-4 py-6 text-center">
              <p className="text-xs text-[var(--text-muted)]">Drop items here</p>
            </div>
          )}
          {items.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              onToggleVisible={onToggleVisible}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function AdminRoadmapClient({ orgSlug, initialData, feedbackPosts }: Props) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<RoadmapData>(initialData);
  const [activeItem, setActiveItem] = useState<RoadmapItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => { setMounted(true); }, []);

  const findItem = useCallback(
    (id: string): { item: RoadmapItem; colKey: keyof RoadmapData } | null => {
      for (const colKey of Object.keys(data) as (keyof RoadmapData)[]) {
        const item = data[colKey].find((i) => i.id === id);
        if (item) return { item, colKey };
      }
      return null;
    },
    [data]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const found = findItem(event.active.id as string);
      if (found) setActiveItem(found.item);
    },
    [findItem]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeFound = findItem(active.id as string);
      if (!activeFound) return;

      const overColKey = (Object.keys(data) as (keyof RoadmapData)[]).find(
        (k) => k === over.id
      );

      if (overColKey) {
        if (activeFound.colKey === overColKey) return;
        setData((prev) => ({
          ...prev,
          [activeFound.colKey]: prev[activeFound.colKey].filter(
            (i) => i.id !== active.id
          ),
          [overColKey]: [
            ...prev[overColKey],
            { ...activeFound.item, status: statusFromColumn(overColKey) },
          ],
        }));
        return;
      }

      const overFound = findItem(over.id as string);
      if (!overFound || activeFound.colKey === overFound.colKey) return;

      setData((prev) => {
        const srcItems = prev[activeFound.colKey].filter((i) => i.id !== active.id);
        const destItems = [...prev[overFound.colKey]];
        const overIndex = destItems.findIndex((i) => i.id === over.id);
        destItems.splice(overIndex, 0, {
          ...activeFound.item,
          status: statusFromColumn(overFound.colKey),
        });
        return {
          ...prev,
          [activeFound.colKey]: srcItems,
          [overFound.colKey]: destItems,
        };
      });
    },
    [data, findItem]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);
      if (!over) return;

      const activeId = active.id as string;
      let persist: { id: string; status: Status; position: number } | null = null;

      setData((prev) => {
        const newData: RoadmapData = { planned: [], inProgress: [], done: [] };
        for (const colKey of Object.keys(prev) as (keyof RoadmapData)[]) {
          newData[colKey] = prev[colKey].map((item, idx) => ({ ...item, position: idx }));
          const idx = newData[colKey].findIndex((i) => i.id === activeId);
          if (idx !== -1) {
            persist = { id: activeId, status: statusFromColumn(colKey), position: idx };
          }
        }
        return newData;
      });

      if (!persist) return;
      const { id, status, position } = persist as { id: string; status: Status; position: number };
      try {
        await fetch(`/api/v1/orgs/${orgSlug}/roadmap/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, position }),
        });
      } catch {
        // silently fail — UI already updated
      }
    },
    [orgSlug]
  );

  const handleToggleVisible = useCallback(
    async (id: string, visible: boolean) => {
      setData((prev) => {
        const newData = { ...prev };
        for (const colKey of Object.keys(newData) as (keyof RoadmapData)[]) {
          newData[colKey] = newData[colKey].map((item) =>
            item.id === id ? { ...item, visible } : item
          );
        }
        return newData;
      });
      await fetch(`/api/v1/orgs/${orgSlug}/roadmap/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
    },
    [orgSlug]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
    },
    []
  );

  const confirmDelete = useCallback(
    async () => {
      if (!deletingId) return;
      const id = deletingId;
      setDeletingId(null);
      setData((prev) => {
        const newData = { ...prev };
        for (const colKey of Object.keys(newData) as (keyof RoadmapData)[]) {
          newData[colKey] = newData[colKey].filter((item) => item.id !== id);
        }
        return newData;
      });
      await fetch(`/api/v1/orgs/${orgSlug}/roadmap/${id}`, { method: "DELETE" });
    },
    [deletingId, orgSlug]
  );

  const handleAdd = useCallback(
    (item: RoadmapItem) => {
      const colKey = itemToColumn(item);
      setData((prev) => ({ ...prev, [colKey]: [...prev[colKey], item] }));
      setShowAddModal(false);
    },
    []
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Roadmap</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Drag cards between columns to update status.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {mounted && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <div className="flex gap-5 min-w-[860px]">
              {STATUS_LIST.map((status) => {
                const colKey = COLUMN_IDS[status];
                return (
                  <AdminColumn
                    key={colKey}
                    colKey={colKey}
                    status={status}
                    items={data[colKey]}
                    onToggleVisible={handleToggleVisible}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeItem && <RoadmapCard item={activeItem} admin isDragging={false} />}
          </DragOverlay>
        </DndContext>
      )}

      {showAddModal && (
        <AddRoadmapItemModal
          orgSlug={orgSlug}
          feedbackPosts={feedbackPosts}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              This will permanently delete this roadmap item. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
