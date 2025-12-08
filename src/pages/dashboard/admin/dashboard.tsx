import React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/pages/dashboard/admin/components/chart-area-ticket-status"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { StatsCards } from "./components/stats-cards"
import { TicketStatusDonut } from "./components/ticket-status-donut"
import { TicketPriorityBar } from "./components/ticket-priority-bar"
import { ProjectStatusChart } from "./components/project-status-chart"
import { RecentTicketsTable } from "./components/recent-tickets-table"
import { useAdminDashboard } from "./hooks/use-admin-dashboard"

export default function AdminDashboard() {
  const { data, loading, error } = useAdminDashboard()

  const metrics = data?.metrics
  const chartData = data?.chartData ?? []
  const recentTickets = data?.recentTickets.slice(0, 10) ?? []

  const notStarted = metrics?.projectsByStatus?.NOT_STARTED ?? 0
  const inProgress = metrics?.projectsByStatus?.IN_PROGRESS ?? 0
  const done = metrics?.projectsByStatus?.DONE ?? 0

  const stats = [
    {
      title: "Total Projects",
      value: metrics?.totalProjects ?? 0,
      accent: "blue" as const,
    },
    {
      title: "Open Tickets",
      value: metrics?.openTickets ?? 0,
      accent: "orange" as const,
    },
    {
      title: "Total Users",
      value: metrics?.totalUsers ?? 0,
      accent: "green" as const,
    },
    {
      title: "Proyek In Progress",
      value: inProgress ?? 0,
      accent: "purple" as const,
    },
  ]

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
              <StatsCards stats={stats} loading={loading} />
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <ChartAreaInteractive data={chartData} loading={loading} />
                </div>
                <TicketStatusDonut
                  data={data?.ticketStatusChart ?? []}
                  loading={loading}
                />
              </div>
              <div className="mr-6 ml-6">
                <TicketPriorityBar
                  data={data?.ticketPriorityChart ?? []}
                  loading={loading}
                />
              </div>
                <div className="mr-6 ml-6">
                  <ProjectStatusChart
                    data={data?.projectStatusChart ?? []}
                    loading={loading}
                  />
                </div>
                <div className="xl:col-span-2 mr-6 ml-6">
                  <RecentTicketsTable
                    tickets={recentTickets}
                    loading={loading}
                    error={error}
                  />
                </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
