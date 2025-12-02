"use client";

import { useParams, useNavigate } from "react-router-dom";
import { AppSidebarDev } from "@/components/app-sidebardev";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useProjectIssues } from "@/features/DevProjectIssue/hook/use-project-issues";
import { ProjectHeader } from "@/features/kanban-board/components/kanban-header";
import { IssuesKanbanBoard } from "@/features/DevProjectIssue/components/issues-kanban-board";

export default function DeveloperProjectIssues() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    issues,
    setIssues,
    loading,
    projectName,
    groups,
    updateIssueStatus,
    findIssue,
  } = useProjectIssues(projectId);

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
            projectName={projectName || "Issue Project"}
            projectId={projectId}
            onBack={handleBack}
          />

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4">
                <p>Loading...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="p-4">
                <p className="text-muted-foreground">
                  Tidak ada issue di project ini.
                </p>
              </div>
            ) : (
              <IssuesKanbanBoard
                issues={issues}
                setIssues={setIssues}
                groups={groups}
                updateIssueStatus={updateIssueStatus}
                findIssue={findIssue}
                isMobile={true}
              />
            )}
          </div>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex flex-col h-[calc(100vh-var(--header-height))]">
          <ProjectHeader
            projectName={projectName || "Issue Project"}
            projectId={projectId}
            onBack={handleBack}
          />

          <div className="flex-1 relative overflow-hidden">
            {loading ? (
              <div className="p-6">
                <p>Loading...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="p-6">
                <p className="text-muted-foreground">
                  Tidak ada issue di project ini.
                </p>
              </div>
            ) : (
              <IssuesKanbanBoard
                issues={issues}
                setIssues={setIssues}
                groups={groups}
                updateIssueStatus={updateIssueStatus}
                findIssue={findIssue}
                isMobile={false}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}