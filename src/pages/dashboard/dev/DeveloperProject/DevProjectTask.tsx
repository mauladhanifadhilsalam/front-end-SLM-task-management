"use client";

import { useParams, useNavigate } from "react-router-dom";
import { AppSidebarDev } from "@/components/app-sidebardev";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useProjectTasks } from "@/features/DevProjectTask/hook/use-project-tasks";
import { ProjectHeader } from "@/features/DevProjectTask/componenst/project-header";
import { KanbanBoard } from "@/features/DevProjectTask/componenst/kanban-board";

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
                isMobile={false}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}