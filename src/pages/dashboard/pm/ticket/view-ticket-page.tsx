"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { useTicketDetail } from "@/features/ticket/hooks/use-ticket-detail"
import { PmTicketDetailView } from "@/features/ticket/components/pm-ticket-detail-view"

export default function ViewTickets() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    ticket,
    loading,
    error,
    deleting,
    formatDate,
    deleteCurrent,
  } = useTicketDetail(id)

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
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <PmTicketDetailView
                ticket={ticket}
                loading={loading}
                error={error}
                deleting={deleting}
                formatDate={formatDate}
                onBack={() => navigate("/project-manager/dashboard/ticket-issue")}
                onDelete={deleteCurrent}
                />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
