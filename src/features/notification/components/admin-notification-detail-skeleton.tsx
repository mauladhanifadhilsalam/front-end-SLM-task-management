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

export function AdminNotificationDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* Card */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-56" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-80" />
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Message */}
                <section className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="rounded-md border bg-muted/40 p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </section>

                <Separator />

                {/* Recipient */}
                <section className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                  </div>
                </section>

                <Separator />

                {/* Target */}
                <section className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </section>

                <Separator />

                {/* Status & Timeline */}
                <section className="space-y-3">
                  <Skeleton className="h-4 w-36" />

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-5 w-28 rounded-full" />
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
