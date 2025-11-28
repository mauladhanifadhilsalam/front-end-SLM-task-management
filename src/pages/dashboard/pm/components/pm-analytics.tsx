"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
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
import { PmAnalyticsChart } from "./pm-analytics-chart"
import type { PmOverview } from "./section-card-pm"

type Props = {
  overview: PmOverview
}

export function PmAnalytics({ overview }: Props) {
  const totalHighCritical =
    overview.openHighPriorityTickets + overview.openCriticalTickets
  const [range, setRange] = React.useState<"7d" | "30d">("7d")

  const ticketsByProject = React.useMemo(
    () =>
      [...overview.ticketsByProject].sort(
        (a, b) => b.openTickets - a.openTickets,
      ),
    [overview.ticketsByProject],
  )

  const statusData = React.useMemo(
    () =>
      overview.ticketsByStatus.map((s) => ({
        name: s.status,
        value: s.count,
      })),
    [overview.ticketsByStatus],
  )

  const priorityData = React.useMemo(
    () =>
      overview.ticketsByPriority.map((p) => ({
        name: p.priority,
        key: toKey(p.priority),
        value: p.count,
      })),
    [overview.ticketsByPriority],
  )

  const priorityConfig = React.useMemo(
    () =>
      priorityData.reduce(
        (acc, item, idx) => {
          acc[item.key] = {
            label: item.name,
            color: priorityColors[idx % priorityColors.length],
          }
          return acc
        },
        {} as ChartConfig,
      ),
    [priorityData],
  )

  const statusConfig: ChartConfig = {
    status: { label: "Status", color: "hsl(var(--primary))" },
  }

  const projectConfig: ChartConfig = {
    project: { label: "Tickets", color: "hsl(var(--primary))" },
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Tickets"
          value={overview.totalTickets}
          hint={`${overview.completedTicketsLast7Days} done / 7d`}
        />
        <MetricCard
          title="Open Tickets"
          value={overview.openTickets}
          hint={`${overview.overdueTickets} overdue / ${overview.inReviewTickets} in review`}
        />
        <MetricCard
          title="High & Critical"
          value={totalHighCritical}
          hint={`${overview.openHighPriorityTickets} high / ${overview.openCriticalTickets} critical`}
        />
        <MetricCard
          title="Projects"
          value={overview.totalProjects}
          hint={`${overview.overdueProjects} overdue / ${overview.activeProjects} active`}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Ticket Activity</CardTitle>
            <CardDescription>
              Created vs completed ({range === "7d" ? "last 7 days" : "last 30 days"})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={range === "7d" ? "default" : "outline"}
              onClick={() => setRange("7d")}
            >
              7d
            </Button>
            <Button
              size="sm"
              variant={range === "30d" ? "default" : "outline"}
              onClick={() => setRange("30d")}
            >
              30d
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4 pt-0 sm:px-5">
          <PmAnalyticsChart overview={overview} range={range} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
            <CardDescription>Donut breakdown of open tickets</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] px-2 sm:px-4">
            {priorityData.length === 0 ? (
              <EmptyState label="No priority data" />
            ) : (
              <ChartContainer
                config={priorityConfig}
                className="h-full w-full min-h-[200px]"
              >
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {priorityData.map((item) => (
                      <Cell
                        key={item.key}
                        fill={`var(--color-${item.key})`}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                </PieChart>
              </ChartContainer>
            )}
            {priorityData.length > 0 && (
              <PriorityLegend items={priorityData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Vertical bar by current status</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] px-2 pb-4 sm:px-4">
            {statusData.length === 0 ? (
              <EmptyState label="No status data" />
            ) : (
              <ChartContainer
                config={statusConfig}
                className="h-full w-full min-h-[200px]"
              >
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    fill="var(--color-status)"
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tickets by Project</CardTitle>
            <CardDescription>Horizontal open-ticket distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] px-2 pb-4 sm:px-4">
            {ticketsByProject.length === 0 ? (
              <EmptyState label="No project data" />
            ) : (
              <ChartContainer
                config={projectConfig}
                className="h-full w-full min-h-[220px]"
              >
                <BarChart
                  data={ticketsByProject.map((p) => ({
                    name: p.name,
                    value: p.openTickets,
                  }))}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => truncateLabel(String(v))}
                    width={140}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(value) => String(value)}
                      />
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-project)"
                    radius={[4, 4, 4, 4]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string
  value: number | string
  hint?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {hint && (
          <p className="text-muted-foreground text-xs leading-snug">{hint}</p>
        )}
      </CardContent>
    </Card>
  )
}

function PriorityLegend({
  items,
}: {
  items: { name: string; key: string; value: number }[]
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: `var(--color-${item.key})` }}
          />
          <span className="text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  )
}

function toKey(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-")
}

function truncateLabel(label: string, max = 18) {
  if (label.length <= max) return label
  return `${label.slice(0, max - 3)}...`
}

const priorityColors = [
  "#6366f1",
  "#f59e0b",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
]
