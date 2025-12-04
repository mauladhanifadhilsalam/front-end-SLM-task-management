"use client"

import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppSidebarDev } from "@/components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProjectTasks } from "@/features/DevProjectTask/hook/use-project-tasks"
import { ProjectHeader } from "@/features/kanban-board/components/kanban-header"
import { TaskForm } from "@/features/kanban-board/components/task-form"
import { TaskViewSwitcher } from "@/features/kanban-board/components/task-view-switcher"
import { useTaskCreation } from "@/features/kanban-board/hooks/use-task-creation"
import { useTaskEditor } from "@/features/kanban-board/hooks/use-task-editor"
import type { Ticket } from "@/types/project-tasks.types"
import { deleteTicket } from "@/services/ticket.service"
import { toast } from "sonner"

export default function DeveloperProjectTasks() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const {
    tickets,
    setTickets,
    loading,
    projectName,
    groups,
    updateTicketStatus,
    findTicket,
    error,
    phases,
    refreshTickets,
  } = useProjectTasks(projectId)

  const taskCreation = useTaskCreation({
    projectId,
    refreshTickets,
  })

  const taskEditor = useTaskEditor(projectId, refreshTickets)

  const headerStats = buildStats(tickets)
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleBack = () => {
    navigate("/developer-dashboard/projects")
  }

  const handleDeleteTask = async (ticket: Ticket) => {
    setDeleteTarget(ticket)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTicket(deleteTarget.id)
      await refreshTickets()
      toast.success("Task dihapus", { description: deleteTarget.title })
      setDeleteTarget(null)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Gagal menghapus task."
      toast.error("Gagal menghapus task", { description: msg })
    } finally {
      setDeleting(false)
    }
  }

  const renderContent = (isMobile: boolean) => {
    if (loading) {
      return (
        <div className={isMobile ? "p-4" : "p-6"}>
          <p>Loading...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className={isMobile ? "p-4 text-destructive" : "p-6 text-destructive"}>{error}</div>
      )
    }

    const editing = taskEditor.editingTicket
    const initialEditValues = editing
      ? {
          title: editing.title,
          description: editing.description ?? "",
          status: editing.status,
          startDate: editing.startDate ?? undefined,
          dueDate: editing.dueDate ?? undefined,
          priority: (editing.priority as any) ?? "MEDIUM",
          assigneeIds: (editing.assignees ?? []).map((a) => String(a.user.id)),
        }
      : undefined

    return (
      <div className={`flex h-full flex-col ${isMobile ? "gap-4 pb-4" : "gap-4 pr-6"}`}>
        {taskCreation.isFormOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-6xl overflow-y-auto animate-in zoom-in-95 slide-in-from-top-4 duration-200">
              <TaskForm
                projectName={projectName}
                defaultStatus={taskCreation.defaultStatus}
                assignees={taskCreation.assignees}
                loadingAssignees={taskCreation.loadingAssignees}
                submitting={taskCreation.submitting}
                errorMessage={taskCreation.error}
                assigneeError={taskCreation.assigneeError}
                statusLocked
                onCancel={taskCreation.closeForm}
                onSubmit={taskCreation.handleSubmit}
              />
            </div>
          </div>
        ) : null}

        {taskEditor.isOpen || taskEditor.isClosing ? (
          <div
            className={`fixed inset-0 z-40 flex items-center justify-center bg-background/70 p-4 transition duration-200 ${
              taskEditor.isClosing ? "animate-out fade-out" : "animate-in fade-in"
            }`}
          >
            <div
              className={`w-full max-w-6xl overflow-y-auto transition duration-200 ${
                taskEditor.isClosing
                  ? "animate-out zoom-out-95 slide-out-to-top-4"
                  : "animate-in zoom-in-95 slide-in-from-top-4"
              }`}
            >
              <TaskForm
                projectName={projectName}
                assignees={taskEditor.assignees}
                loadingAssignees={taskEditor.loadingAssignees}
                submitting={false}
                errorMessage={taskEditor.error}
                assigneeError={taskEditor.assigneeError}
                statusLocked={false}
                initialValues={initialEditValues}
                submitLabel="Update Task"
                onCancel={taskEditor.close}
                onSubmit={taskEditor.handleSubmit}
              />
            </div>
          </div>
        ) : null}

        <div className="flex-1 min-h-0">
          <TaskViewSwitcher
            tickets={tickets}
            setTickets={setTickets}
            groups={groups}
            updateTicketStatus={updateTicketStatus}
            findTicket={findTicket}
            buildDetailLink={(ticket) => `/developer-dashboard/projects/${ticket.projectId}/tasks/${ticket.id}`}
            isMobile={isMobile}
            phases={phases}
            onAddTask={taskCreation.openForm}
            onEditTask={taskEditor.open}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
    )
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
      <AppSidebarDev variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => (!open ? setDeleteTarget(null) : undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus task?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget ? deleteTarget.title : "Task akan dihapus dari project ini."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting} onClick={() => setDeleteTarget(null)}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* MOBILE LAYOUT */}
        <div className="md:hidden flex flex-col h-full">
          <ProjectHeader
            projectName={projectName}
            projectId={projectId}
            stats={headerStats}
            onBack={handleBack}
          />

          <div className="flex-1 overflow-y-auto">{renderContent(true)}</div>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex flex-col h-[calc(100vh-var(--header-height))]">
          <ProjectHeader
            projectName={projectName}
            projectId={projectId}
            stats={headerStats}
            onBack={handleBack}
          />

          <div className="flex-1 relative overflow-hidden pl-6 pr-2">{renderContent(false)}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function buildStats(tickets: Ticket[]) {
  const total = tickets.length
  const completed = tickets.filter((t) => {
    const status = String(t.status || "").toUpperCase()
    return (
      status === "DONE" ||
      status === "RESOLVED" ||
      status === "CLOSED" ||
      status === "COMPLETED" ||
      status.includes("DONE") ||
      status.includes("RESOLVED") ||
      status.includes("CLOSED") ||
      status.includes("COMPLETE")
    )
  }).length

  const inProgress = tickets.filter((t) => String(t.status || "").toUpperCase() === "IN_PROGRESS").length
  const todo = tickets.filter((t) => String(t.status || "").toUpperCase() === "TO_DO").length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, inProgress, todo, completionPct }
}
