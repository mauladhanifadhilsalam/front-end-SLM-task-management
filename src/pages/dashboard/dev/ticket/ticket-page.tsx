"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"

import { AppSidebarDev } from "@/components/app-sidebardev"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TicketSummaryCharts } from "@/pages/dashboard/pm/ticket/ticket-summary-charts"
import { TicketsCardsBoard } from "@/features/ticket/components/tickets-cards-issue-board"
import { getCurrentUserId } from "@/utils/get-current-user"
import { useAdminTickets } from "@/features/ticket/hooks/use-admin-tickets"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function DevTicketsPage() {
  const navigate = useNavigate()

  const {
    tickets,
    loading,
    error,
    q,
    cols: _cols,
    setSearch,
    toggleColumn: _toggleColumn,
    formatDate,
    deleteTicket,
    hasFilter,
  } = useAdminTickets()

  const currentUserId = getCurrentUserId()

  const reportedTickets = React.useMemo(
    () =>
      tickets.filter(
        (t) =>
          String(t.type).toUpperCase() === "ISSUE" &&
          Number(t.requesterId) === currentUserId,
      ),
    [tickets, currentUserId],
  )

  const assignedTickets = React.useMemo(
    () =>
      tickets.filter((t) => {
        if (String(t.type).toUpperCase() !== "ISSUE") return false

        const isReportedByYou = Number(t.requesterId) === currentUserId

        const ids = Array.isArray(t.assigneeIds)
          ? t.assigneeIds.map((i: any) => Number(i))
          : []

        const isAssignedToYou = ids.includes(currentUserId)

        return isAssignedToYou && !isReportedByYou
      }),
    [tickets, currentUserId],
  )

  const handleCreateIssue = React.useCallback(() => {
    navigate("/developer-dashboard/ticket-issue/create")
  }, [navigate])

  const handleDelete = React.useCallback(
    (id: number) => {
      deleteTicket(id)
    },
    [deleteTicket],
  )

  const handleAddAttachment = (id: number) => {
    navigate(`/developer-dashboard/ticket-issue/${id}/attachments/new`)
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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-7 pt-4">
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold">Issues</h1>
                  <p className="text-xs text-muted-foreground">
                    Lihat issue yang ditugaskan ke kamu dan issue yang kamu report.
                  </p>
                </div>

                <div className="flex flex-1 items-center gap-2 sm:flex-none max-w-md">
                  <div className="relative flex-1">
                    <IconSearch className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={q}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search issues..."
                      className="h-9 pl-8 text-xs"
                    />
                  </div>

                  <Button size="sm" onClick={handleCreateIssue} className="shrink-0">
                    <IconPlus className="mr-1 h-4 w-4" />
                    New issue
                  </Button>
                </div>
              </div>

              <div className="px-7">
                <TicketSummaryCharts tickets={tickets} />
              </div>

              <TicketsCardsBoard
                title="Issues assigned to you"
                tickets={assignedTickets}
                loading={loading}
                error={error}
                hasFilter={hasFilter}
                formatDate={formatDate}
                onView={(id) =>
                  navigate(`/developer-dashboard/ticket-issue/view/${id}`, {
                    state: { canEdit: false, canDelete: false },
                  })
                }
                onDelete={() => {}}
                canDelete={false}
                onEdit={() => {}}
                canEdit={false}
                canAssignUser={false}
              />

              <TicketsCardsBoard
                title="Issues reported by you"
                subtitle="Issue yang kamu buat / kamu laporkan ke tim."
                emptyMessage="Belum ada issue yang kamu report."
                tickets={reportedTickets}
                loading={loading}
                error={error}
                onDelete={handleDelete}
                formatDate={formatDate}
                hasFilter={hasFilter}
                onAddAttachment={handleAddAttachment}
                onEdit={(id) => navigate(`/developer-dashboard/ticket-issue/edit/${id}`)}
                onView={(id) =>
                  navigate(`/developer-dashboard/ticket-issue/view/${id}`, {
                    state: { canEdit: true, canDelete: true },
                  })
                }
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
