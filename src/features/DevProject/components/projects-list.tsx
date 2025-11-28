import { DeveloperProjectCard } from "./project-card";
import { AssignmentCard } from "@/types/developer-projects.types";

interface DeveloperProjectsListProps {
  assignments: AssignmentCard[];
  loading: boolean;
  error?: string | null;
}

export function DeveloperProjectsList({
  assignments,
  loading,
  error,
}: DeveloperProjectsListProps) {
  if (loading) {
    return <p className="text-muted-foreground">Memuat data...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (assignments.length === 0) {
    return (
      <p className="text-muted-foreground">
        Tidak ada project yang ditugaskan kepada Anda.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {assignments.map((assignment) => (
        <DeveloperProjectCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}