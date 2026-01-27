"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PmDeveloperHighlight } from "@/types/pm-overview.type"
import { Skeleton } from "@/components/ui/skeleton"
type Props = {
  data?: PmDeveloperHighlight[] | null
  loading?: boolean
}

export function DeveloperSummary({ data, loading }: Props) {
  const summary = React.useMemo(() => {
    const list = Array.isArray(data) ? data : []
    const totalDev = list.length
    const highPriority = list.reduce(
      (acc, dev) =>
        acc +
        (dev.openTasksHighPriority || 0) +
        (dev.openIssuesHighPriority || 0),
      0,
    )
    const overdue = list.reduce((acc, dev) => acc + (dev.overdueTasks || 0), 0)
    const dueSoon = list.reduce(
      (acc, dev) =>
        acc + (dev.tasksDueNext7Days || 0) + (dev.issuesDueNext7Days || 0),
      0,
    )
    const avgWorkload =
      totalDev > 0
        ? Math.round(
            (list.reduce((acc, dev) => acc + (dev.workloadIndex || 0), 0) /
              totalDev) *
              10,
          ) / 10
        : 0

    return { totalDev, highPriority, overdue, dueSoon, avgWorkload }
  }, [data])

  const metrics = [
    { label: "Total dev", value: summary.totalDev },
    { label: "High priority", value: summary.highPriority },
    { label: "Overdue", value: summary.overdue },
    { label: "Due 7d", value: summary.dueSoon },
    { label: "Avg WL", value: summary.avgWorkload },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((m) => (
        <MetricCard
          key={m.label}
          title={m.label}
          value={loading ? null : m.value}
          loading={loading}
        />
      ))}
    </div>
  )
}

function MetricCard({
  title,
  value,
  loading,
}: {
  title: string
  value: number | string | null
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold tabular-nums">
            {value ?? "-"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
