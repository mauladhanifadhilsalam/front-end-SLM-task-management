"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTaskDetail } from "@/features/DevDetailTask/hook/use-task-detail"
import { TaskDetailCard } from "@/features/DevDetailTask/components/task-detail-card"

export default function PmProjectTaskDetailPage() {
  const { projectId, taskId } = useParams()
  const navigate = useNavigate()

  const { task, loading, error, projectName } = useTaskDetail(projectId, taskId)

  const handleBack = () => {
    if (projectId) {
      navigate(`/project-manager/dashboard/projects/tasks/${projectId}`)
    } else {
      navigate("/project-manager/dashboard/projects")
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarPm variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <main className="p-6 space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projectName || "Project"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Task Detail - ID: {taskId}
            </p>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Memuat detail task...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : !task ? (
            <p className="text-muted-foreground">Task tidak ditemukan.</p>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6">
              <TaskDetailCard task={task} />
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
