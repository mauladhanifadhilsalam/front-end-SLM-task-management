import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type StatCard = {
  title: string
  value?: number | string
  accent?: "blue" | "green" | "orange" | "purple"
}

type SectionCardsProps = {
  stats: StatCard[]
  loading?: boolean
}


export function SectionCards({ stats, loading = false }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, idx) => (
        <Card
          key={`${item.title}-${idx}`}
          className={`@container/card bg-gradient-to-br to-card shadow-sm border-border/70`}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <div className="space-y-1">
              <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.title}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
                {loading ? <Skeleton className="h-7 w-12" /> : item.value ?? "-"}
              </CardTitle>
            </div>
            <CardAction>
              <Badge variant="outline" className="text-[11px] px-2 py-1">
                {idx + 1}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
