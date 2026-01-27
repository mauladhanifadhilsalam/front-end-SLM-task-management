// src/components/developer/skeleton-quick-stats.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonQuickStats() {
  return (
    <div className="lg:col-span-2 grid grid-cols-2 gap-3">
      {/* Total Tasks */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            <Skeleton className="h-3 w-20" />
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent className="pb-2 space-y-2">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            <Skeleton className="h-3 w-20" />
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent className="pb-2 space-y-2">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>

      {/* Completion Percentage */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            <Skeleton className="h-3 w-24" />
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent className="pb-2 space-y-2">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>

      {/* Overdue Tasks */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            <Skeleton className="h-3 w-24" />
          </CardTitle>
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent className="pb-2 space-y-2">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    </div>
  )
}
