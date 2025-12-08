import React from "react"
import { Link } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminDashboard } from "./hooks/use-admin-dashboard"
import type { AdminTicket } from "@/types/ticket-type"

const statusVariant = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "NEW":
    case "TO_DO":
      return "secondary" as const
    case "IN_PROGRESS":
      return "default" as const
    case "IN_REVIEW":
      return "outline" as const
    case "DONE":
    case "RESOLVED":
    case "CLOSED":
      return "success" as const
    default:
      return "secondary" as const
  }
}

const priorityVariant = (priority?: string) => {
  switch ((priority ?? "").toUpperCase()) {
    case "LOW":
      return "outline" as const
    case "MEDIUM":
      return "secondary" as const
    case "HIGH":
      return "default" as const
    case "CRITICAL":
      return "destructive" as const
    default:
      return "secondary" as const
  }
}

const formatDate = (iso?: string | null) => {
  if (!iso) return "-"
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

type RecentTicketsProps = {
  tickets: AdminTicket[]
  loading: boolean
  error?: string | null
}

function RecentTicketsTable({ tickets, loading, error }: RecentTicketsProps) {
  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Ticket terbaru</CardTitle>
          <CardDescription>
            10 ticket terakhir yang masuk ke sistem.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/dashboard/tickets">Lihat semua</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="text-left">
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due / Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      </TableRow>
                    ))
                  : tickets.length > 0
                    ? tickets.map((ticket) => (
                        <TableRow key={ticket.id} className="text-left">
                          <TableCell className="font-medium">
                            {ticket.title || `Ticket #${ticket.id}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {ticket.projectName || `Project #${ticket.projectId}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(ticket.status)}>
                              {ticket.status || "UNKNOWN"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={priorityVariant(ticket.priority)}>
                              {ticket.priority || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div>{formatDate(ticket.dueDate)}</div>
                            <div className="text-xs">
                              Dibuat {formatDate(ticket.createdAt)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                          Belum ada tiket untuk ditampilkan.
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { data, loading, error } = useAdminDashboard()

  const metrics = data?.metrics
  const chartData = data?.chartData ?? []
  const recentTickets = data?.recentTickets.slice(0, 10) ?? []

  const notStarted = metrics?.projectsByStatus?.NOT_STARTED ?? 0
  const inProgress = metrics?.projectsByStatus?.IN_PROGRESS ?? 0
  const done = metrics?.projectsByStatus?.DONE ?? 0

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
              {error && (
                <div className="mx-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive lg:mx-6">
                  {error}
                </div>
              )}
              <SectionCards
                totalProjects={metrics?.totalProjects}
                notStarted={notStarted}
                inProgress={inProgress}
                done={done}
                totalTickets={metrics?.totalTickets}
                loading={loading}
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={chartData} loading={loading} />
              </div>
              <RecentTicketsTable
                tickets={recentTickets}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
