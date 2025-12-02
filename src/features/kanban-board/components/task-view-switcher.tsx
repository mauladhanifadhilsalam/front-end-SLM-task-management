import { useState, type Dispatch, type SetStateAction } from "react";
import { ChartGantt, Kanban as KanbanIcon, Milestone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, TicketGroups, TicketStatus } from "@/types/project-tasks.types";
import type { Phase } from "@/types/project-phases.type";
import { KanbanBoard } from "./kanban-board";
import { TaskGanttView } from "./task-gantt-view";
import { PhaseGanttView } from "./phase-gantt-view";

type TaskViewSwitcherProps = {
  tickets: Ticket[];
  setTickets: Dispatch<SetStateAction<Ticket[]>>;
  groups: TicketGroups;
  updateTicketStatus: (ticketId: number, newStatus: TicketStatus) => Promise<void>;
  findTicket: (id: string) => Ticket | undefined;
  isMobile?: boolean;
  onAddTask?: (status: TicketStatus) => void;
  buildDetailLink?: (ticket: Ticket) => string;
  phases?: Phase[];
};

export const TaskViewSwitcher = ({
  tickets,
  setTickets,
  groups,
  updateTicketStatus,
  findTicket,
  isMobile = false,
  onAddTask,
  buildDetailLink,
  phases = [],
}: TaskViewSwitcherProps) => {
  const [view, setView] = useState<"kanban" | "gantt">("kanban");
  const [ganttMode, setGanttMode] = useState<"tasks" | "phases">("tasks");
  const hasTickets = tickets.length > 0;
  const hasPhases = phases.length > 0;

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "gantt")} className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <TabsList className="inline-flex h-11 items-center gap-1 rounded-xl border border-border/70 bg-muted/70 px-1.5 shadow-sm">
          <TabsTrigger
            value="kanban"
            className="gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground data-[state=active]:border data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <KanbanIcon className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger
            value="gantt"
            className="gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground data-[state=active]:border data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <ChartGantt className="h-4 w-4" />
            Gantt
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="kanban" className="h-full">
        {hasTickets ? (
          isMobile ? (
            <KanbanBoard
              tickets={tickets}
              setTickets={setTickets}
              groups={groups}
              updateTicketStatus={updateTicketStatus}
              findTicket={findTicket}
              isMobile
              onAddTask={onAddTask}
              buildDetailLink={buildDetailLink}
            />
          ) : (
            <div className="relative h-full">
              <KanbanBoard
                tickets={tickets}
                setTickets={setTickets}
                groups={groups}
                updateTicketStatus={updateTicketStatus}
                findTicket={findTicket}
                isMobile={false}
                onAddTask={onAddTask}
                buildDetailLink={buildDetailLink}
              />
            </div>
          )
        ) : (
          <EmptyState message="Tidak ada task di project ini." />
        )}
      </TabsContent>

      <TabsContent value="gantt" className="h-full">
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tampilkan</span>
            <div className="inline-flex h-9 items-center gap-1 rounded-lg border border-border/70 bg-muted/60 px-1">
              <button
                type="button"
                onClick={() => setGanttMode("tasks")}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold transition ${
                  ganttMode === "tasks"
                    ? "border border-border bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <ChartGantt className="h-4 w-4" />
                Tasks
              </button>
              <button
                type="button"
                onClick={() => setGanttMode("phases")}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold transition ${
                  ganttMode === "phases"
                    ? "border border-border bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <Milestone className="h-4 w-4" />
                Phases
              </button>
            </div>
          </div>

          <div className="h-full">
            {ganttMode === "tasks" ? (
              <TaskGanttView tickets={tickets} className="h-full" />
            ) : hasPhases ? (
              <PhaseGanttView phases={phases} className="h-full" />
            ) : (
              <EmptyState message="Phase belum tersedia untuk ditampilkan." />
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/40 px-4 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
