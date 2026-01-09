"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import { AppSidebar } from "@/pages/dashboard/admin/components/sidebar-admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { useTicketDetail } from "@/features/ticket/hooks/use-ticket-detail"
import { TicketDetailView } from "@/features/ticket/components/ticket-detail-view"

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
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <TicketDetailView
              ticket={ticket}
              loading={loading}
              error={error}
              deleting={deleting}
              formatDate={formatDate}
              onBack={() => navigate("/admin/dashboard/tickets")}
              onDelete={deleteCurrent}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
