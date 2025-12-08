"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"

type RangeOption = "6m" | "3m" | "1m"

export type AdminChartPoint = {
  date: string
  open: number
  closed: number
}

type Props = {
  data: AdminChartPoint[]
  loading?: boolean
}

const chartConfig = {
  open: {
    label: "Ticket terbuka",
    color: "var(--primary)",
  },
  closed: {
    label: "Ticket selesai",
    color: "hsl(var(--chart-2, 210 90% 56%))",
  },
} satisfies ChartConfig

const RANGE_COPY: Record<RangeOption, string> = {
  "6m": "6 bulan terakhir",
  "3m": "3 bulan terakhir",
  "1m": "1 bulan terakhir",
}

export function ChartAreaInteractive({ data, loading = false }: Props) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<RangeOption>("6m")

  React.useEffect(() => {
    if (isMobile) setTimeRange("3m")
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!Array.isArray(data)) return []

    const months = timeRange === "1m" ? 1 : timeRange === "3m" ? 3 : 6
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - (months - 1), 1)

    return data.filter((item) => {
      const parsed = new Date(item.date)
      const ts = parsed.getTime()
      if (!Number.isFinite(ts)) return false
      return parsed >= cutoff
    })
  }, [data, timeRange])

  const hasData = filteredData.length > 0

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Ticket by Status</CardTitle>
        <CardAction className="gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => setTimeRange((val as RangeOption) ?? timeRange)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="6m">6 Month</ToggleGroupItem>
            <ToggleGroupItem value="3m">3 Month</ToggleGroupItem>
            <ToggleGroupItem value="1m">1 Month</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange(val as RangeOption)}
          >
            <SelectTrigger
              className="flex w-36 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih rentang waktu"
            >
              <SelectValue placeholder="6 bulan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="6m" className="rounded-lg">
                6 bulan terakhir
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                3 bulan terakhir
              </SelectItem>
              <SelectItem value="1m" className="rounded-lg">
                1 bulan terakhir
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-xl" />
        ) : hasData ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-open)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-open)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillClosed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-closed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-closed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("id-ID", {
                    month: "short",
                    year: "2-digit",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="open"
                type="monotone"
                fill="url(#fillOpen)"
                stroke="var(--color-open)"
              />
              <Area
                dataKey="closed"
                type="monotone"
                fill="url(#fillClosed)"
                stroke="var(--color-closed)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Belum ada data tiket pada rentang ini.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
