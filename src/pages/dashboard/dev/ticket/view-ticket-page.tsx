"use client"

import * as React from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"

import { AppSidebarDev } from "@/components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { useTicketDetail } from "@/features/ticket/hooks/use-ticket-detail"
import { PmTicketDetailView } from "@/features/ticket/components/pm-ticket-detail-view"

type ViewState = {
  canEdit?: boolean
  canDelete?: boolean
}

export default function DevViewTicketIssue() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const state = (location.state as ViewState) || {}

  const canEdit = state.canEdit ?? false
  const canDelete = state.canDelete ?? false

  const {
    ticket,
    loading,
    error,
    deleting,
    formatDate,
    deleteCurrent,
  } = useTicketDetail(id, {
    onDeletedPath: "/developer-dashboard/ticket-issue",
  })

  const handleAddAttachment = (ticketId: number) => {
    navigate(`/developer-dashboard/ticket-issue/${ticketId}/attachments/new`)
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
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <PmTicketDetailView
              ticket={ticket}
              loading={loading}
              error={error}
              deleting={deleting}
              formatDate={formatDate}
              onBack={() => navigate("/developer-dashboard/ticket-issue")}
              onDelete={deleteCurrent}
              canEdit={canEdit}
              canDelete={canDelete}
              onAddAttachment={handleAddAttachment}
              buildEditHref={(ticketId) =>
                `/developer-dashboard/ticket-issue/edit/${ticketId}`
              }
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
