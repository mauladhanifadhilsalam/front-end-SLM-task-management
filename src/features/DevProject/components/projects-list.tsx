import { DeveloperProjectCard } from "./project-card"
import { AssignmentCard } from "@/types/developer-projects.types"
import { Skeleton } from "@/components/ui/skeleton"

interface DeveloperProjectsListProps {
  assignments: AssignmentCard[]
  loading: boolean
  error?: string | null
}

function DeveloperProjectCardSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}

export function DeveloperProjectsList({
  assignments,
  loading,
  error,
}: DeveloperProjectsListProps) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <DeveloperProjectCardSkeleton key={idx} />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive">{error}</p>
  }

  if (assignments.length === 0) {
    return (
      <p className="text-muted-foreground">
        Tidak ada project yang ditugaskan kepada Anda.
      </p>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {assignments.map((assignment) => (
        <DeveloperProjectCard
          key={assignment.id}
          assignment={assignment}
        />
      ))}
    </div>
  )
}
