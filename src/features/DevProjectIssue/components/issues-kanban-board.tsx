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
import { Issue, IssueGroups, IssueStatus } from "@/types/project-issues.types";
import { SortableIssueCard } from "./sortable-issue-card";
import { TaskColumn } from "@/features/DevProjectTask/componenst/task-column";
import { DragOverlayCard } from "@/features/DevProjectTask/componenst/drag-overlay-card";
import { formatStatus } from "@/utils/format.utils";

interface IssuesKanbanBoardProps {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  groups: IssueGroups;
  updateIssueStatus: (issueId: number, newStatus: IssueStatus) => Promise<void>;
  findIssue: (id: string) => Issue | undefined;
  isMobile?: boolean;
}

const STATUSES: IssueStatus[] = [
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
];

export const IssuesKanbanBoard = ({
  issues,
  setIssues,
  groups,
  updateIssueStatus,
  findIssue,
  isMobile = false,
}: IssuesKanbanBoardProps) => {
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

    const activeIssue = findIssue(active.id);
    if (!activeIssue) return;

    const overData = over.data.current;

    // Drop pada column
    if (overData?.type === "column") {
      const newStatus = overData.status as IssueStatus;

      if (newStatus === activeIssue.status) return;

      await updateIssueStatus(activeIssue.id, newStatus);
      return;
    }

    // Drop pada issue (reordering dalam column yang sama)
    if (overData?.type === "issue") {
      if (activeIssue.status !== overData.issue.status) return;

      const list = groups[activeIssue.status];
      const oldIndex = list.findIndex((i) => String(i.id) === active.id);
      const newIndex = list.findIndex((i) => String(i.id) === overData.issue.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(list, oldIndex, newIndex);

      setIssues((prev) => {
        const others = prev.filter((i) => i.status !== activeIssue.status);
        return [...others, ...reordered];
      });
    }
  };

  const activeIssue = activeId ? findIssue(activeId) : null;

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
                items={groups[status].map((i) => String(i.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="rounded-xl p-3 space-y-3 border border-border bg-card">
                  {groups[status].length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Tidak ada issue
                    </p>
                  ) : (
                    groups[status].map((issue) => (
                      <SortableIssueCard key={issue.id} issue={issue} />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeIssue && <DragOverlayCard ticket={activeIssue} />}
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
                items={groups[status].map((i) => String(i.id))}
                strategy={verticalListSortingStrategy}
              >
                <TaskColumn status={status}>
                  {groups[status].map((issue) => (
                    <SortableIssueCard key={issue.id} issue={issue} />
                  ))}
                </TaskColumn>
              </SortableContext>
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeIssue && <DragOverlayCard ticket={activeIssue} />}
      </DragOverlay>
    </DndContext>
  );
};