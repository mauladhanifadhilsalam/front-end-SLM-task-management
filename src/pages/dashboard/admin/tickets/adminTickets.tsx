"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminTicketsTable } from "@/features/ticket/components/admin-tickets-table"
import { useAdminTickets } from "@/features/ticket/hooks/use-admin-tickets"

export default function AdminTicketsPage() {
  const navigate = useNavigate()
  const {
    tickets,
    loading,
    error,
    q,
    cols,
    setSearch,
    toggleColumn,
    formatDate,
    deleteTicket,
    hasFilter,
  } = useAdminTickets()

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <AdminTicketsTable
                tickets={tickets}
                loading={loading}
                error={error}
                q={q}
                cols={cols}
                onSearchChange={setSearch}
                onToggleColumn={toggleColumn}
                onDelete={deleteTicket}
                onCreate={() =>
                  navigate("/admin/dashboard/tickets/create")
                }
                formatDate={formatDate}
                hasFilter={hasFilter}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
