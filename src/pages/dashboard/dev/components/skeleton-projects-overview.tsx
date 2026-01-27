// src/components/developer/skeleton-projects-overview.tsx
import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonProjectsOverview() {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <Skeleton className="h-2 w-16" />
                  <Skeleton className="h-2 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
