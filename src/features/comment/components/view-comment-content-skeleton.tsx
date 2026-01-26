"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ViewCommentContentSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

      {/* Content */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-36" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Ticket + User */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ticket */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>

              {/* User */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="rounded border bg-muted/20 p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
