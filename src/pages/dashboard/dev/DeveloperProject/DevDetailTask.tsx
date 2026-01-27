"use client";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AppSidebarDev } from "@/pages/dashboard/dev/components/app-sidebardev";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTaskDetail } from "@/features/DevDetailTask/hook/use-task-detail";
import { TaskDetailCard } from "@/features/DevDetailTask/components/task-detail-card";
import { TaskDetailSkeleton } from "@/features/DevDetailTask/components/task-detail-skeleton";

export default function DeveloperTaskDetail() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { task, loading, error, projectName } = useTaskDetail(
    projectId,
    taskId
  );

  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1);
    } else {
      navigate(`/developer-dashboard/projects/${projectId}`);
    }
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

        <main className="p-6 space-y-6">
          {/* Tombol Kembali */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projectName || "Project"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Task Detail - ID: {taskId}
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-muted-foreground"><TaskDetailSkeleton /></p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : !task ? (
            <p className="text-muted-foreground">Task tidak ditemukan.</p>
          ) : (
            <TaskDetailCard task={task} />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}