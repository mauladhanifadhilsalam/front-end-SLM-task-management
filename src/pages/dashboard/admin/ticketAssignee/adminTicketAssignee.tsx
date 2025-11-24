"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"
import { useTicketAssignees } from "@/features/ticket-assignee/hooks/use-ticket-assignees"
import { TicketAssigneesToolbar } from "@/features/ticket-assignee/components/ticket-assignees-toolbar"
import { TicketAssigneesTable } from "@/features/ticket-assignee/components/ticket-assignees-table"
const AdminTicketAssignees: React.FC = () => {
  const navigate = useNavigate()

  const {
    assignees,
    loading,
    error,
    search,
    statusFilter,
    cols,
    filteredAssignees,
    visibleColCount,
    handleSearchChange,
    handleStatusFilterChange,
    handleToggleColumn,
    handleDeleteAssignee,
  } = useTicketAssignees()

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
        <main className="flex flex-col flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                Ticket Assignments
              </h1>
              <p className="text-muted-foreground">
                Kelola assignment ticket ke user/developer.
              </p>
            </div>
          </div>

          <TicketAssigneesToolbar
            search={search}
            statusFilter={statusFilter}
            cols={cols}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusFilterChange}
            onToggleColumn={handleToggleColumn}
          />

          <TicketAssigneesTable
            assignees={assignees}
            filteredAssignees={filteredAssignees}
            loading={loading}
            error={error}
            cols={cols}
            visibleColCount={visibleColCount}
            onDelete={handleDeleteAssignee}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminTicketAssignees
