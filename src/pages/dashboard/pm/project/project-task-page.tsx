"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useProjectTasks } from "@/features/DevProjectTask/hook/use-project-tasks"
import { ProjectHeader } from "@/features/kanban-board/components/kanban-header"
import { KanbanBoard } from "@/features/kanban-board/components/kanban-board"
import type { Ticket } from "@/types/project-tasks.types"

export default function ProjectTaskPage() {
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
  } = useProjectTasks(projectId)

  const handleBack = () => {
    navigate("/project-manager/dashboard/projects")
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
        <div
          className={`${
            isMobile ? "p-4" : "p-6"
          } text-sm text-destructive`}
        >
          {error}
        </div>
      )
    }

    const hasTickets = tickets.length > 0

    return (
      <>
        <div className={isMobile ? "p-4" : "p-6 pt-4"}>
          <ProjectTaskSummary
            projectName={projectName}
            projectId={projectId}
            tickets={tickets}
          />
        </div>

        {hasTickets ? (
          <KanbanBoard
            tickets={tickets}
            setTickets={setTickets}
            groups={groups}
            updateTicketStatus={updateTicketStatus}
            findTicket={findTicket}
            isMobile={isMobile}
          />
        ) : (
          <div className={isMobile ? "p-4" : "px-6 pb-6"}>
            <p className="text-muted-foreground">
              Tidak ada task di project ini.
            </p>
          </div>
        )}
      </>
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
      <AppSidebarPm variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="md:hidden flex flex-col h-full">
          <ProjectHeader
            projectName={projectName}
            projectId={projectId}
            onBack={handleBack}
          />

          <div className="flex-1 overflow-y-auto">{renderContent(true)}</div>
        </div>

        <div className="hidden md:flex flex-col h-[calc(100vh-var(--header-height))]">
          <ProjectHeader
            projectName={projectName}
            projectId={projectId}
            onBack={handleBack}
          />

          <div className="flex-1 relative overflow-hidden">
            {renderContent(false)}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

type SummaryProps = {
  projectName: string
  projectId?: string
  tickets: Ticket[]
}

function ProjectTaskSummary({ projectName, projectId, tickets }: SummaryProps) {
  const total = tickets.length
  const completed = tickets.filter((t) =>
    ["DONE", "RESOLVED", "CLOSED"].includes(t.status),
  ).length
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length
  const todo = tickets.filter((t) => t.status === "TO_DO").length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background p-4 shadow-sm sm:p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-6 -bottom-10 h-28 w-28 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
            Project
          </p>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {projectName || "Project Tasks"}
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          ID: {projectId || "-"}
        </div>
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatPill label="Total Tasks" value={total} tone="primary" />
        <StatPill label="In Progress" value={inProgress} tone="blue" />
        <StatPill label="To Do" value={todo} tone="slate" />
        <StatPill label="Completion" value={`${completionPct}%`} tone="emerald" />
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: "primary" | "blue" | "slate" | "emerald"
}) {
  const toneClass: Record<typeof tone, string> = {
    primary: "border-primary/30 bg-primary/5 text-primary",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${toneClass[tone]}`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
