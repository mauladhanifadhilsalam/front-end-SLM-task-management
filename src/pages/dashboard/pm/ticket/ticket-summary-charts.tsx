"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { AdminTicket } from "@/types/ticket-type"

type SummaryItem = { label: string; key: string; value: number; color: string }

type Props = {
  tickets: AdminTicket[]
}

export function TicketSummaryCharts({ tickets }: Props) {
  const issueTickets = React.useMemo(
    () =>
      tickets.filter(
        (t) => String(t.type || "").toUpperCase() === "ISSUE",
      ),
    [tickets],
  )

  const statusSummary = React.useMemo(
    () => buildStatusSummary(issueTickets),
    [issueTickets],
  )
  const prioritySummary = React.useMemo(
    () => buildPrioritySummary(issueTickets),
    [issueTickets],
  )

  const statusChartConfig = React.useMemo(
    () =>
      statusSummary.reduce((acc, item) => {
        acc[item.key] = { label: item.label, color: item.color }
        return acc
      }, {} as ChartConfig),
    [statusSummary],
  )

  const priorityChartConfig = React.useMemo<ChartConfig>(
    () => ({
      value: { label: "Priority", color: "#2563eb" },
    }),
    [],
  )

  const hasTickets = issueTickets.length > 0

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Ringkasan Ticket</CardTitle>
          <CardDescription>Status dan prioritas ticket (type ISSUE)</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-4">
        {!hasTickets ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            Belum ada ticket untuk ditampilkan.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 md:items-center">
            <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-sm font-semibold text-foreground">Status Ticket</h3>
                <span className="text-xs text-muted-foreground">Total {issueTickets.length}</span>
              </div>
              {statusSummary.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  Tidak ada status
                </div>
              ) : (
                <ChartContainer
                  config={statusChartConfig}
                  className="mx-auto aspect-square w-full max-w-[240px]"
                >
                  <PieChart>
                    <Pie
                      data={statusSummary}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {statusSummary.map((item) => (
                        <Cell key={item.key} fill={`var(--color-${item.key})`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              )}
            </div>

            <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-sm font-semibold text-foreground">Prioritas Ticket</h3>
                <span className="text-xs text-muted-foreground">Total {issueTickets.length}</span>
              </div>
              {prioritySummary.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  Tidak ada prioritas
                </div>
              ) : (
                <div className="grid place-items-center">
                  <ChartContainer
                    config={priorityChartConfig}
                    className="mx-auto aspect-square w-full max-w-[260px] justify-self-center"
                  >
                    <RadarChart data={prioritySummary} outerRadius={85}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <Radar
                        dataKey="value"
                        stroke="var(--color-value)"
                        fill="var(--color-value)"
                        fillOpacity={0.45}
                      />
                    </RadarChart>
                  </ChartContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function buildStatusSummary(tickets: AdminTicket[]): SummaryItem[] {
  const counts = new Map<string, number>()

  tickets.forEach((ticket) => {
    const label = toTitleCase(ticket.status ?? "Unknown")
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  return Array.from(counts.entries()).map(([label, value], idx) => ({
    label,
    key: toKey(label),
    value,
    color: statusPalette[idx % statusPalette.length],
  }))
}

function buildPrioritySummary(tickets: AdminTicket[]): SummaryItem[] {
  const counts = new Map<string, number>()

  tickets.forEach((ticket) => {
    const label = toTitleCase(ticket.priority ?? "Unknown")
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  return Array.from(counts.entries()).map(([label, value], idx) => ({
    label,
    key: toKey(label),
    value,
    color: priorityPalette[idx % priorityPalette.length],
  }))
}

function toKey(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-")
}

function toTitleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const statusPalette = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#06b6d4",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
]

const priorityPalette = [
  "#2563eb",
  "#1d4ed8",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
]
