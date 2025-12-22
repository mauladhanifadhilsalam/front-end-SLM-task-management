"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"

import { AppSidebarPm } from "../components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TaskSummaryCharts } from "./task-summary-charts"
import { TicketsCardsTaskBoard } from "@/features/ticket/components/tickets-cards-task-board"
import { useUserAssignedTasks } from "@/features/ticket/hooks/use-user-assigned-tasks"
import { useUserReportedTasks } from "@/features/ticket/hooks/use-user-reported-tasks"
import type {
  AdminTicket,
  TicketPriority,
  TicketStatus,
} from "@/types/ticket-type"
import { getCurrentUserId } from "@/utils/get-current-user"
import { IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PmTaskTicketsPage() {
  const navigate = useNavigate()

  const currentUserId = getCurrentUserId()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<TicketStatus | "all">(
    "all",
  )
  const [
    priorityFilter,
    setPriorityFilter,
  ] = React.useState<TicketPriority | "all">("all")

  const {
    tickets: assignedTickets,
    loading: assignedLoading,
    error: assignedError,
  } = useUserAssignedTasks(currentUserId, search)

  const {
    tickets: reportedTickets,
    loading: reportedLoading,
    error: reportedError,
    deleteTicket: deleteReportedTicket,
  } = useUserReportedTasks(currentUserId, search)

  const hasFilter =
    search.trim().length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all"

  const normalizeStatus = React.useCallback(
    (status?: string) => String(status ?? "").toUpperCase(),
    [],
  )

  const normalizePriority = React.useCallback(
    (priority?: string) => String(priority ?? "").toUpperCase(),
    [],
  )

  const filterTickets = React.useCallback(
    (tickets: AdminTicket[]) => {
      const q = search.trim().toLowerCase()
      return tickets.filter((t) => {
        const title = (t.title ?? "").toLowerCase()
        const matchesTitle = q ? title.includes(q) : true
        const matchesStatus =
          statusFilter === "all" ||
          normalizeStatus(t.status) === normalizeStatus(statusFilter)
        const matchesPriority =
          priorityFilter === "all" ||
          normalizePriority(t.priority) === normalizePriority(priorityFilter)

        return matchesTitle && matchesStatus && matchesPriority
      })
    },
    [search, statusFilter, priorityFilter, normalizeStatus, normalizePriority],
  )

  const filteredAssigned = React.useMemo(
    () => filterTickets(assignedTickets),
    [assignedTickets, filterTickets],
  )

  const filteredReported = React.useMemo(
    () => filterTickets(reportedTickets),
    [reportedTickets, filterTickets],
  )

  const summaryTickets = React.useMemo(
    () => [...filteredAssigned, ...filteredReported],
    [filteredAssigned, filteredReported],
  )

  const formatDate = React.useCallback((iso?: string) => {
    if (!iso) return "-"
    const d = new Date(iso)
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }, [])

  const viewTaskDetail = React.useCallback(
    (id: number) => {
      const ticket = [...filteredAssigned, ...filteredReported].find(
        (t) => t.id === id,
      )
      const projectId = ticket?.projectId
      if (!projectId) return
      navigate(`/project-manager/dashboard/projects/${projectId}/tasks/${id}`)
    },
    [filteredAssigned, filteredReported, navigate],
  )

  const handleDelete = React.useCallback(
    (id: number) => {
      deleteReportedTicket(id)
    },
    [deleteReportedTicket],
  )

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="space-y-1 px-7">
                <h1 className="text-xl font-semibold">Tickets</h1>
                <p className="text-xs text-muted-foreground">
                  Lihat task ticket yang ditugaskan ke kamu dan yang kamu ajukan.
                </p>
              </div>

              <div className="px-7">
                <TaskSummaryCharts tickets={summaryTickets} />
              </div>

              <div className="flex flex-col gap-3 px-7 pt-4">
                <div className="flex flex-1 flex-col gap-2 sm:flex-none sm:max-w-2xl">
                  <div className="relative flex-1">
                    <IconSearch className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tasks..."
                      className="h-9 pl-8 text-xs"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={(v) =>
                        setStatusFilter((v as TicketStatus | "all") ?? "all")
                      }
                    >
                      <SelectTrigger className="h-9 w-full min-w-[140px] sm:w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All status</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="TO_DO">To do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                        <SelectItem value="IN_REVIEW">In review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={priorityFilter}
                      onValueChange={(v) =>
                        setPriorityFilter(
                          (v as TicketPriority | "all") ?? "all",
                        )
                      }
                    >
                      <SelectTrigger className="h-9 w-full min-w-[140px] sm:w-[180px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All priority</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <TicketsCardsTaskBoard
                title="Tasks assigned to you"
                tickets={filteredAssigned}
                loading={assignedLoading}
                error={assignedError}
                hasFilter={hasFilter}
                formatDate={formatDate}
                onView={viewTaskDetail}
                onDelete={() => {}}
                canDelete={false}
                onEdit={() => {}}
                canEdit={false}
                canAssignUser={false}
              />

              <TicketsCardsTaskBoard
                title="Tasks reported by you"
                subtitle="Task ticket yang kamu buat / ajukan ke tim."
                emptyMessage="Belum ada task yang kamu ajukan."
                tickets={filteredReported}
                loading={reportedLoading}
                error={reportedError}
                onDelete={handleDelete}
                formatDate={formatDate}
                hasFilter={hasFilter}
                onView={viewTaskDetail}
                onEdit={() => {}}
                canEdit={false}
                canAssignUser={false}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
