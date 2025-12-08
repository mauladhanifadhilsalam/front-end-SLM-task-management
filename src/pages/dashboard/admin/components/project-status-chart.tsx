import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

export type ProjectStatusDatum = { status: string; count: number }

export function ProjectStatusChart({
  data,
  loading,
}: {
  data: ProjectStatusDatum[]
  loading: boolean
}) {
  const normalized = data.filter((d) => d.count > 0)
  const config: ChartConfig = {
    project: { label: "Projects", color: "#8b5cf6" },
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Status Project</CardTitle>
        <CardDescription>Ringkasan status proyek aktif</CardDescription>
      </CardHeader>
      <CardContent className="h-[230px] px-3 sm:px-4 pt-2">
        {loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : normalized.length > 0 ? (
          <ChartContainer
            config={config}
            className="aspect-auto h-full w-full min-h-[180px] justify-start sm:justify-center"
          >
            <BarChart
              data={normalized.map((p) => ({
                ...p,
                status: p.status.replace(/_/g, " "),
              }))}
              layout="vertical"
              barSize={50}
              margin={{ left: 12, right: 12, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
              <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                dataKey="status"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => String(value)}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-project)" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState label="Belum ada data proyek" />
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
