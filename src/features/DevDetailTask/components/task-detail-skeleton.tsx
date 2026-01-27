"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TaskCommentsSkeleton } from "./task-comments-skeleton"

export function TaskDetailSkeleton() {
    const getRole = localStorage.getItem("role");
    const widhtTaskDetail = getRole === "developer" ? "max-w-6xl" : "mx-auto max-w-4xl";
  return (
    <div className={` ${widhtTaskDetail} w-full space-y-6`}>
      <Card>
        <CardContent className="space-y-6 p-6">
          {/* Title */}
          <Skeleton className="h-7 w-2/3" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            ))}
          </div>

          <Separator />

          {/* Assignees */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <div className="space-y-1">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-64" />
              ))}
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <TaskCommentsSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}
