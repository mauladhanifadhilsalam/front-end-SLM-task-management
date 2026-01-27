"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function TicketDetailViewSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-4" />

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-96" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}

            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            <div className="md:col-span-2">
              <Separator className="my-2" />
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
              <Skeleton className="h-4 w-4/6 mt-1" />
            </div>

            <div className="md:col-span-2">
              <Separator className="my-4" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>

            <div className="md:col-span-2">
              <Separator className="my-4" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-16 w-full mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
