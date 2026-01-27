"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const ProjectDetailCardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-72" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-96" />
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-56" />
        </div>
      </CardContent>
    </Card>
  )
}
