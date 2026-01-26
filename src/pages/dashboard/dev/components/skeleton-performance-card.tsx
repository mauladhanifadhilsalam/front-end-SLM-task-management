// src/components/developer/skeleton-performance-card.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonPerformanceCard() {
  return (
    <Card className="border-2 border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        {/* Circle Progress */}
        <div className="flex items-center justify-center">
          <Skeleton className="h-28 w-28 rounded-full" />
        </div>

        {/* Score Text */}
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-20 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
