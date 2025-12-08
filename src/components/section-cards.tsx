import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SectionCardsProps = {
  totalProjects?: number
  notStarted?: number
  inProgress?: number
  done?: number
  totalTickets?: number
  loading?: boolean
}

export function SectionCards({
  totalProjects = 0,
  notStarted = 0,
  inProgress = 0,
  done = 0,
  totalTickets,
  loading = false,
}: SectionCardsProps) {
  const formatValue = (value: number) =>
    loading ? <Skeleton className="h-7 w-10" /> : value

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Project</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
            {formatValue(totalProjects)}
          </CardTitle>
          {typeof totalTickets === "number" && (
            <CardAction>
              <Badge variant="outline" className="text-xs">
                {loading ? "Memuat tiket..." : `${totalTickets} tiket`}
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Not Started</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatValue(notStarted)}
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>In Progress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatValue(inProgress)}
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Done</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatValue(done)}
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
      
      </Card>
    </div>
  )
}
