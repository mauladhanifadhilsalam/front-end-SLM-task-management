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

  const handleAssignTicket = () => {
    navigate("/admin/dashboard/ticket-assignees/create")
  }

  return (
    <div className="w-full overflow-x-hidden">
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

          <div className="flex flex-1 flex-col overflow-x-hidden">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">
                      Ticket Assignments
                    </h1>
                    <p className="text-muted-foreground pt-2">
                      Kelola assignment ticket ke user/developer.
                    </p>
                  </div>
                  <Button
                    onClick={handleAssignTicket}
                    className="shrink-0 w-full sm:w-auto"
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    Assign Ticket Baru
                  </Button>
                </div>

                {/* Toolbar */}
                <TicketAssigneesToolbar
                  search={search}
                  statusFilter={statusFilter}
                  cols={cols}
                  onSearchChange={handleSearchChange}
                  onStatusChange={handleStatusFilterChange}
                  onToggleColumn={handleToggleColumn}
                />

                {/* Table wrapper */}
                <div className="w-full overflow-x-auto">
                  <TicketAssigneesTable
                    assignees={assignees}
                    filteredAssignees={filteredAssignees}
                    loading={loading}
                    error={error}
                    cols={cols}
                    visibleColCount={visibleColCount}
                    onDelete={handleDeleteAssignee}
                  />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default AdminTicketAssignees