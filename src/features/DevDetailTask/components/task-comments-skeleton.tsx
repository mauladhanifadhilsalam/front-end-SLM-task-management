import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function TaskCommentsSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <Separator />

      {/* Header */}
      <Skeleton className="h-4 w-40" />

      {/* Input */}
      <div className="space-y-2">
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Comment bubbles */}
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-md border p-3 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}
