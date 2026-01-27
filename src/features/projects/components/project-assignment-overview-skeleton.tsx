"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { IconUsers } from "@tabler/icons-react"

export const ProjectAssignmentsOverviewSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="space-y-1">
          <CardTitle>
            <Skeleton className="h-5 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </div>
        <IconUsers className="h-5 w-5 text-muted-foreground opacity-50" />
      </CardHeader>

      <CardContent className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 rounded border bg-card p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>

              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
