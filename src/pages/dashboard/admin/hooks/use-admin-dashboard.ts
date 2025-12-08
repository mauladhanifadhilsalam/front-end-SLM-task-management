import * as React from "react"

import { fetchProjectOwners } from "@/services/project-owner.service"
import { fetchProjects } from "@/services/project.service"
import { fetchAdminTickets } from "@/services/ticket.service"
import { fetchUsers } from "@/services/user.service"
import type { AdminTicket } from "@/types/ticket-type"

export type AdminDashboardMetrics = {
  totalProjects: number
  totalTickets: number
  totalUsers: number
  totalProjectOwners: number
  projectsByStatus: Record<string, number>
  ticketsByStatus: Record<string, number>
  openTickets: number
  closedTickets: number
}

export type AdminChartPoint = {
  date: string
  open: number
  closed: number
}

export type AdminDashboardState = {
  metrics: AdminDashboardMetrics
  chartData: AdminChartPoint[]
  recentTickets: AdminTicket[]
}

type DashboardStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"

const CLOSED_STATUSES = new Set(["DONE", "RESOLVED", "CLOSED"])

const normalizeStatus = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toUpperCase()

const buildChartData = (tickets: AdminTicket[]): AdminChartPoint[] => {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(now)
    d.setMonth(now.getMonth() - (5 - idx), 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    return {
      key,
      date: d.toISOString().slice(0, 10),
    }
  })

  const monthBuckets = months.reduce<Record<string, { open: number; closed: number }>>(
    (acc, { key }) => {
      acc[key] = { open: 0, closed: 0 }
      return acc
    },
    {},
  )

  tickets.forEach((ticket) => {
    const rawDate = ticket.createdAt ?? ticket.startDate ?? ticket.dueDate
    const parsedDate = rawDate ? new Date(rawDate) : now
    const key = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(
      2,
      "0",
    )}`

    if (!monthBuckets[key]) return

    const status = normalizeStatus(ticket.status)
    const bucket = monthBuckets[key]

    if (CLOSED_STATUSES.has(status)) {
      bucket.closed += 1
    } else {
      bucket.open += 1
    }
  })

  return months.map(({ key, date }) => ({
    date,
    open: monthBuckets[key]?.open ?? 0,
    closed: monthBuckets[key]?.closed ?? 0,
  }))
}

const buildMetrics = (
  projects: Awaited<ReturnType<typeof fetchProjects>>,
  tickets: AdminTicket[],
  usersCount: number,
  ownersCount: number,
): AdminDashboardMetrics => {
  const projectsByStatus: Record<string, number> = {
    NOT_STARTED: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  }

  projects.forEach((project) => {
    const status = normalizeStatus(project.status)
    if (status in projectsByStatus) {
      projectsByStatus[status] += 1
    }
  })

  const ticketsByStatus: Record<string, number> = {}
  let closedTickets = 0

  tickets.forEach((ticket) => {
    const status = normalizeStatus(ticket.status)
    ticketsByStatus[status] = (ticketsByStatus[status] ?? 0) + 1
    if (CLOSED_STATUSES.has(status)) closedTickets += 1
  })

  return {
    totalProjects: projects.length,
    totalTickets: tickets.length,
    totalUsers: usersCount,
    totalProjectOwners: ownersCount,
    projectsByStatus,
    ticketsByStatus,
    openTickets: Math.max(tickets.length - closedTickets, 0),
    closedTickets,
  }
}

export const useAdminDashboard = () => {
  const [status, setStatus] = React.useState<DashboardStatus>("idle")
  const [error, setError] = React.useState<string | null>(null)
  const [state, setState] = React.useState<AdminDashboardState | null>(null)

  React.useEffect(() => {
    let active = true
    const fetchData = async () => {
      setStatus("loading")
      setError(null)

      try {
        const [projects, tickets, users, owners] = await Promise.all([
          fetchProjects(),
          fetchAdminTickets(),
          fetchUsers(),
          fetchProjectOwners(),
        ])

        if (!active) return

        const metrics = buildMetrics(projects, tickets, users.length, owners.length)
        const chartData = buildChartData(tickets)

        const recentTickets = [...tickets].sort((a, b) => {
          const getTs = (val?: string | null) => {
            if (!val) return 0
            const t = new Date(val).getTime()
            return Number.isFinite(t) ? t : 0
          }

          const tsA = getTs(a.updatedAt ?? a.createdAt ?? a.startDate ?? a.dueDate)
          const tsB = getTs(b.updatedAt ?? b.createdAt ?? b.startDate ?? b.dueDate)
          return tsB - tsA
        })

        setState({
          metrics,
          chartData,
          recentTickets,
        })
        setStatus("success")
      } catch (err) {
        if (!active) return
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memuat dashboard. Coba refresh halaman."
        setError(message)
        setStatus("error")
      }
    }

    fetchData()
    return () => {
      active = false
    }
  }, [])

  return {
    loading: status === "loading",
    error,
    data: state,
  }
}
