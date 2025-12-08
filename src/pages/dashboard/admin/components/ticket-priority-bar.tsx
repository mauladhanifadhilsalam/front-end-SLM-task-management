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

export type TicketPriorityDatum = { priority: string; count: number }

export function TicketPriorityBar({
  data,
  loading,
}: {
  data: TicketPriorityDatum[]
  loading: boolean
}) {
  const normalized = data.filter((d) => d.count > 0)
  const config: ChartConfig = {
    priority: { label: "Priority", color: "#0ea5e9" },
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Prioritas Ticket</CardTitle>
        <CardDescription>Jumlah ticket per prioritas</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] px-3 sm:px-4 pt-2">
        {loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : normalized.length > 0 ? (
          <ChartContainer
            config={config}
            className="aspect-auto h-full w-full min-h-[180px] justify-center"
          >
            <BarChart data={normalized} barCategoryGap={16} barSize={100}>
              <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" />
              <XAxis dataKey="priority" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--color-priority)" />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState label="Belum ada data prioritas" />
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
