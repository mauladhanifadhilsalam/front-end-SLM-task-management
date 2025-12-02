"use client";

import { useParams, useNavigate } from "react-router-dom";
import { AppSidebarDev } from "@/components/app-sidebardev";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useProjectTasks } from "@/features/DevProjectTask/hook/use-project-tasks";
import { ProjectHeader } from "@/features/kanban-board/components/kanban-header";
import { KanbanBoard } from "@/features/kanban-board/components/kanban-board";
import type { Ticket } from "@/types/project-tasks.types";

export default function DeveloperProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    tickets,
    setTickets,
    loading,
    projectName,
    groups,
    updateTicketStatus,
    findTicket,
  } = useProjectTasks(projectId);

  const headerStats = buildStats(tickets);

  const handleBack = () => {
    navigate("/developer-dashboard/projects");
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebarDev variant="inset" />
      <SidebarInset>
        <SiteHeader />

        {/* MOBILE LAYOUT */}
        <div className="md:hidden flex flex-col h-full">
          <ProjectHeader
            projectName={projectName}
            projectId={projectId}
            stats={headerStats}
            onBack={handleBack}
          />

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4">
                <p>Loading...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-4">
                <p className="text-muted-foreground">
                  Tidak ada task di project ini.
                </p>
              </div>
            ) : (
              <KanbanBoard
                tickets={tickets}
                setTickets={setTickets}
                groups={groups}
                updateTicketStatus={updateTicketStatus}
                findTicket={findTicket}
                buildDetailLink={(ticket) =>
                  `/developer-dashboard/projects/${ticket.projectId}/tasks/${ticket.id}`
                }
                isMobile={true}
              />
            )}
          </div>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex flex-col h-[calc(100vh-var(--header-height))]">
          <ProjectHeader
            projectName={projectName}
            projectId={projectId}
            stats={headerStats}
            onBack={handleBack}
          />

          <div className="flex-1 relative overflow-hidden">
            {loading ? (
              <div className="p-6">
                <p>Loading...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-6">
                <p className="text-muted-foreground">
                  Tidak ada task di project ini.
                </p>
              </div>
            ) : (
              <KanbanBoard
                tickets={tickets}
                setTickets={setTickets}
                groups={groups}
                updateTicketStatus={updateTicketStatus}
                findTicket={findTicket}
                buildDetailLink={(ticket) =>
                  `/developer-dashboard/projects/${ticket.projectId}/tasks/${ticket.id}`
                }
                isMobile={false}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function buildStats(tickets: Ticket[]) {
  const total = tickets.length;
  const completed = tickets.filter((t) => {
    const status = String(t.status || "").toUpperCase();
    return (
      status === "DONE" ||
      status === "RESOLVED" ||
      status === "CLOSED" ||
      status === "COMPLETED" ||
      status.includes("DONE") ||
      status.includes("RESOLVED") ||
      status.includes("CLOSED") ||
      status.includes("COMPLETE")
    );
  }).length;

  const inProgress = tickets.filter(
    (t) => String(t.status || "").toUpperCase() === "IN_PROGRESS",
  ).length;
  const todo = tickets.filter(
    (t) => String(t.status || "").toUpperCase() === "TO_DO",
  ).length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, inProgress, todo, completionPct };
}
