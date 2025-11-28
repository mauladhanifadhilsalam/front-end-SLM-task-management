import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensors,
  useSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Ticket, TicketGroups, TicketStatus } from "@/types/project-tasks.types";
import { SortableTaskCard } from "./sortable-task-card";
import { TaskColumn } from "./task-column";
import { DragOverlayCard } from "./drag-overlay-card";
import { formatStatus } from "@/utils/format.utils";

interface KanbanBoardProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  groups: TicketGroups;
  updateTicketStatus: (ticketId: number, newStatus: TicketStatus) => Promise<void>;
  findTicket: (id: string) => Ticket | undefined;
  isMobile?: boolean;
}

const STATUSES: TicketStatus[] = [
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
];

export const KanbanBoard = ({
  tickets,
  setTickets,
  groups,
  updateTicketStatus,
  findTicket,
  isMobile = false,
}: KanbanBoardProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTicket = findTicket(active.id);
    if (!activeTicket) return;

    const overData = over.data.current;

    // Drop pada column
    if (overData?.type === "column") {
      const newStatus = overData.status as TicketStatus;

      if (newStatus === activeTicket.status) return;

      await updateTicketStatus(activeTicket.id, newStatus);
      return;
    }

    // Drop pada ticket (reordering dalam column yang sama)
    if (overData?.type === "ticket") {
      if (activeTicket.status !== overData.ticket.status) return;

      const list = groups[activeTicket.status];
      const oldIndex = list.findIndex((t) => String(t.id) === active.id);
      const newIndex = list.findIndex((t) => String(t.id) === overData.ticket.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(list, oldIndex, newIndex);

      setTickets((prev) => {
        const others = prev.filter((t) => t.status !== activeTicket.status);
        return [...others, ...reordered];
      });
    }
  };

  const activeTicket = activeId ? findTicket(activeId) : null;

  if (isMobile) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4 p-4">
          {STATUSES.map((status) => (
            <div key={status} className="flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatStatus(status)}
                </h2>

                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {groups[status].length}
                </span>
              </div>

              <SortableContext
                items={groups[status].map((t) => String(t.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="rounded-xl p-3 space-y-3 border border-border bg-card">
                  {groups[status].length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Tidak ada task
                    </p>
                  ) : (
                    groups[status].map((ticket) => (
                      <SortableTaskCard key={ticket.id} ticket={ticket} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTicket && <DragOverlayCard ticket={activeTicket} />}
        </DragOverlay>
      </DndContext>
    );
  }

  // Desktop Layout
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="absolute inset-0 overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          scrollbarGutter: "stable",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="inline-flex gap-6 h-full p-6 min-w-full">
          {STATUSES.map((status) => (
            <div key={status} className="w-[320px] flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatStatus(status)}
                </h2>

                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {groups[status].length}
                </span>
              </div>

              <SortableContext
                items={groups[status].map((t) => String(t.id))}
                strategy={verticalListSortingStrategy}
              >
                <TaskColumn status={status}>
                  {groups[status].map((ticket) => (
                    <SortableTaskCard key={ticket.id} ticket={ticket} />
                  ))}
                </TaskColumn>
              </SortableContext>
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTicket && <DragOverlayCard ticket={activeTicket} />}
      </DragOverlay>
    </DndContext>
  );
};