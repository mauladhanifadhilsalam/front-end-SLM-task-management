"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { PmOverview } from "./section-card-pm"

type Props = {
  overview: PmOverview
  range: "7d" | "30d"
}

type ChartPoint = {
  name: string
  created: number
  completed: number
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const chartConfig = {
  created: { label: "Created", color: "#2563eb" }, // blue-600
  completed: { label: "Completed", color: "#93c5fd" }, // blue-300
} satisfies ChartConfig

export function PmAnalyticsChart({ overview, range }: Props) {
  const data = buildChartData(overview, range)

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[240px] w-full"
    >
      <AreaChart data={data} margin={{ left: 6, right: 12 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={26}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <defs>
          <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-created)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--color-created)" stopOpacity={0.05} />
          </linearGradient>

          <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-completed)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-completed)" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="created"
          stroke="var(--color-created)"
          strokeWidth={2}
          fill="url(#createdFill)"
          dot={{ r: 3, strokeWidth: 1, stroke: "var(--color-created)" }}
          activeDot={{ r: 5 }}
        />

        <Area
          type="monotone"
          dataKey="completed"
          stroke="var(--color-completed)"
          strokeWidth={2}
          fill="url(#completedFill)"
          dot={{ r: 3, strokeWidth: 1, stroke: "var(--color-completed)" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

// ========= helper: generate area chart data for 7d/30d views =========

function buildChartData(
  overview: PmOverview,
  range: "7d" | "30d",
): ChartPoint[] {
  const totalCompleted =
    range === "7d"
      ? overview.completedTicketsLast7Days || 0
      : overview.completedTicketsLast30Days ||
        overview.completedTicketsLast7Days ||
        0

  const approxCreated = Math.max(
    overview.openTickets + totalCompleted,
    totalCompleted,
    overview.totalTickets,
    1,
  )

  const points = range === "7d" ? 7 : 10
  const labels =
    range === "7d"
      ? DAYS
      : Array.from({ length: points }, (_, idx) => `Day ${idx + 1}`)

  const baseCompleted = Math.floor(totalCompleted / points)
  const baseCreated = Math.floor(approxCreated / points)

  return labels.map((label, idx) => {
    const extraC = idx === points - 2 ? totalCompleted % points : 0
    const extraCr = idx === points - 3 ? approxCreated % points : 0

    return {
      name: label,
      created: Math.max(baseCreated + extraCr, 0),
      completed: Math.max(baseCompleted + extraC, 0),
    }
  })
}
