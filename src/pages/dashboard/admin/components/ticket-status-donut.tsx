import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

export type TicketStatusDatum = { status: string; count: number }

const STATUS_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9"]

export function TicketStatusDonut({
  data,
  loading,
}: {
  data: TicketStatusDatum[]
  loading: boolean
}) {
  const normalized = data.filter((d) => d.count > 0)
  const hasData = normalized.length > 0

  const config: ChartConfig = normalized.reduce((acc, item, idx) => {
    acc[item.status] = { label: item.status, color: STATUS_COLORS[idx % STATUS_COLORS.length] }
    return acc
  }, {} as ChartConfig)

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle>Status Ticket</CardTitle>
        <CardDescription>Distribusi status terbaru</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] px-3 sm:px-4 pt-2">
        {loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : hasData ? (
          <>
            <ChartContainer
              config={config}
              className="aspect-auto h-full w-full justify-center"
            >
              <PieChart>
                <Pie
                  data={normalized}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {normalized.map((item, idx) => (
                    <Cell key={item.status} fill={`var(--color-${item.status})`} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className=" flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              {normalized.map((item, idx) => (
                <div key={item.status} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[idx % STATUS_COLORS.length] }}
                  />
                  <span>{item.status}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[240px] items-center justify-center">
            <EmptyState label="Belum ada data status ticket" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}
