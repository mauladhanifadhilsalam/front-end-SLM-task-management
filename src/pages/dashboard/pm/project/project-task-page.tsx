"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useProjectTasks } from "@/features/DevProjectTask/hook/use-project-tasks"
import { ProjectHeader } from "@/features/kanban-board/components/kanban-header"
import { TaskViewSwitcher } from "@/features/kanban-board/components/task-view-switcher"
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
    phases,
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

    return (
      <div className="flex h-full flex-col">

        <div className={`${isMobile ? "px-4 pb-6" : "px-6 pb-6"} flex-1`}>
          <TaskViewSwitcher
            tickets={tickets}
            setTickets={setTickets}
            groups={groups}
            updateTicketStatus={updateTicketStatus}
            findTicket={findTicket}
            isMobile={isMobile}
            phases={phases}
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

