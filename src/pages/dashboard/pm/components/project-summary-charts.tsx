"use client"

import * as React from "react"
import {
  Pie,
  PieChart,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from "recharts"

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
import type { Project } from "@/types/project.type"

type SummaryItem = { label: string; key: string; value: number; color: string }

type Props = {
  projects: Project[]
}

export function ProjectSummaryCharts({ projects }: Props) {
  const statusSummary = React.useMemo(() => buildStatusSummary(projects), [projects])
  const categorySummary = React.useMemo(
    () => buildCategorySummary(projects),
    [projects],
  )
  const totalStatuses = statusSummary.length
  const totalCategories = categorySummary.length

  const statusChartConfig = React.useMemo(
    () =>
      statusSummary.reduce((acc, item) => {
        acc[item.key] = { label: item.label, color: item.color }
        return acc
      }, {} as ChartConfig),
    [statusSummary],
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Ringkasan Project</CardTitle>
          <CardDescription>Distribusi status & kategori project</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1 bg-card/60">Status: {totalStatuses}</span>
          <span className="rounded-full border px-3 py-1 bg-card/60">Kategori: {totalCategories}</span>
          <span className="rounded-full border px-3 py-1 bg-card/60">Total Project: {projects.length}</span>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-4">
        {projects.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            Belum ada project untuk ditampilkan.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <ChartBlock
              title="Status Project"
              total={projects.length}
              summary={statusSummary}
              config={statusChartConfig}
            />
            <CategoryRadarBlock
              title="Kategori Project"
              total={projects.length}
              summary={categorySummary}
              emptyLabel="Belum ada kategori di project"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ChartBlock({
  title,
  summary,
  total,
  config,
  emptyLabel = "Tidak ada data",
}: {
  title: string
  summary: SummaryItem[]
  total: number
  config: ChartConfig
  emptyLabel?: string
}) {
  return (
    <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">Total {total}</span>
      </div>
      {summary.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-[260px]">
            <ChartContainer
              config={config}
              className="mx-auto aspect-square w-full"
            >
              <PieChart>
                <Pie
                  data={summary}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {summary.map((item) => (
                    <Cell key={item.key} fill={`var(--color-${item.key})`} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border bg-background/85 px-3 py-1 text-center text-xs font-semibold text-foreground shadow-sm">
                {total} total
              </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 ">
            {summary.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryRadarBlock({
  title,
  summary,
  total,
  emptyLabel = "Tidak ada data",
}: {
  title: string
  summary: SummaryItem[]
  total: number
  emptyLabel?: string
}) {
  const radarConfig = React.useMemo<ChartConfig>(
    () => ({
      value: { label: "Kategori", color: "#2563eb" },
    }),
    [],
  )

  return (
    <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">Total {total}</span>
      </div>
      {summary.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-2 place-items-center">
          <ChartContainer
            config={radarConfig}
            className="mx-auto aspect-square w-full max-w-[260px] justify-self-center"
          >
            <RadarChart data={summary} outerRadius={85}>
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
  )
}

function buildStatusSummary(projects: Project[]): SummaryItem[] {
  const counts = new Map<string, number>()

  projects.forEach((project) => {
    const label = formatStatusLabel(project.status ?? "Unknown")
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  return Array.from(counts.entries()).map(([label, value], idx) => ({
    label,
    key: toKey(label),
    value,
    color: chartPalette[idx % chartPalette.length],
  }))
}

function buildCategorySummary(projects: Project[]): SummaryItem[] {
  const counts = new Map<string, number>()

  projects.forEach((project) => {
    project.categories.forEach((cat) => {
      const label = cat.trim() || "Lainnya"
      counts.set(label, (counts.get(label) ?? 0) + 1)
    })
  })

  return Array.from(counts.entries()).map(([label, value], idx) => ({
    label,
    key: toKey(label),
    value,
    color: categoryPalette[idx % categoryPalette.length],
  }))
}

function formatStatusLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function toKey(label: string) {
  return label.toLowerCase().replace(/\s+/g, "-")
}

const chartPalette = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#06b6d4",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#eab308",
]

const categoryPalette = [
  "#2563eb",
  "#1d4ed8",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
]
