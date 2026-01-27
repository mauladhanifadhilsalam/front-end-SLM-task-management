// src/components/developer/skeleton-activity-cards.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonActivityCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <Skeleton className="h-3 w-40 mt-2" />
        </CardHeader>

        <CardContent className="space-y-2 pb-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-md bg-muted border border-border"
            >
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Current Focus */}
      <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
          <Skeleton className="h-3 w-40 mt-2" />
        </CardHeader>

        <CardContent className="space-y-2 pb-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-md border border-border bg-muted space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
