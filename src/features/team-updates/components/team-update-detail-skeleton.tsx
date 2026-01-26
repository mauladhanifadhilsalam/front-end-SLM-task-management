"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TeamUpdateDetailSkeleton() {
  return (
    <div className="">
      <div>

        <CardContent className="space-y-6">
          {/* Badge row */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-64 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Yesterday / Today */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="rounded-xl border p-6 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>

          {/* Blocker / Next Action */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-6 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="rounded-xl border p-6 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
