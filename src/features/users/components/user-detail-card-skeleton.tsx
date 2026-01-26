"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const UserDetailCardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-64" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-48" />
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-40" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-64" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>

          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
