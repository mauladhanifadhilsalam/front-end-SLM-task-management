"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { PmDailyCadence } from "@/types/pm-daily-cadence.type"

type Props = {
  data: PmDailyCadence | null
  loading?: boolean
  error?: string | null
}

const progressConfig: ChartConfig = {
  progress: { label: "Progress", color: "#3b82f6" },
  remaining: { label: "Remaining Progress", color: "#ef4444" },
}

const summaryConfig: ChartConfig = {
  developers: { label: "Developers", color: "#3b82f6" },
  issues: { label: "Issues", color: "#ef4444" },
  modules: { label: "Modules", color: "#10b981" },
}

export function PmDailyCadenceCharts({ data, loading, error }: Props) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Cadence Charts</CardTitle>
          <CardDescription>Ringkasan progres harian.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Memuat chart...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Cadence Charts</CardTitle>
          <CardDescription>Ringkasan progres harian.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-destructive">{error}</CardContent>
      </Card>
    )
  }

  const safeData = data ?? {
    progress: "0",
    remainingProgress: "0",
    totalDevelopersInvolved: 0,
    totalIssues: 0,
    totalModules: 0,
  }

  const progressValue = clampPercent(safeData.progress)
  const remainingValue = clampPercent(safeData.remainingProgress)

  const progressData = [
    {
      name: "Progress",
      progress: progressValue,
      remaining: remainingValue,
    },
  ]

  const summaryData = [
    {
      label: "Today",
      developers: safeData.totalDevelopersInvolved,
      issues: safeData.totalIssues,
      modules: safeData.totalModules,
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Progress vs Remaining</CardTitle>
          <CardDescription>Persentase progres harian.</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] sm:h-[260px]">
          <ChartContainer
            config={progressConfig}
            className="h-full w-full min-h-[200px] sm:min-h-[220px] aspect-auto"
          >
            <BarChart data={progressData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {Number(value).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="progress"
                fill="var(--color-progress)"
                radius={[6, 6, 0, 0]}
                stackId="progress"
              />
              <Bar
                dataKey="remaining"
                fill="var(--color-remaining)"
                radius={[6, 6, 0, 0]}
                stackId="progress"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issue Snapshot</CardTitle>
          <CardDescription>Issues, developers, dan modul hari ini.</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px] sm:h-[260px]">
          <ChartContainer
            config={summaryConfig}
            className="h-full w-full min-h-[200px] sm:min-h-[220px] aspect-auto"
          >
            <BarChart data={summaryData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="developers"
                radius={[6, 6, 0, 0]}
                fill="var(--color-developers)"
              />
              <Bar
                dataKey="issues"
                radius={[6, 6, 0, 0]}
                fill="var(--color-issues)"
              />
              <Bar
                dataKey="modules"
                radius={[6, 6, 0, 0]}
                fill="var(--color-modules)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function clampPercent(value: string | number) {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 0
  return Math.min(100, Math.max(0, numeric))
}
