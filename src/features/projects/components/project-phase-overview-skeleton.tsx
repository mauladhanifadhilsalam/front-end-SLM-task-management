"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

import { Skeleton } from "@/components/ui/skeleton"
import { IconTimeline } from "@tabler/icons-react"

export const ProjectPhasesOverviewSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="space-y-1">
          <CardTitle>
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </div>
        <IconTimeline className="h-5 w-5 text-muted-foreground opacity-50" />
      </CardHeader>

      <CardContent className="space-y-4">
        <ol className="relative ms-3 border-s border-border space-y-4">
          {[...Array(4)].map((_, i) => (
            <li key={i} className="ms-4 relative">
              <div className="absolute -start-[7px] mt-1 h-3 w-3 rounded-full border border-border bg-muted" />

              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>

                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
