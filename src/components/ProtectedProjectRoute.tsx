import { ReactNode, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProjectAccess } from "@/hooks/use-project-access";
import { ForbiddenError } from "@/pages/errors/forbidden";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedProjectRouteProps {
  children: ReactNode;
}

export function ProtectedProjectRoute({ children }: ProtectedProjectRouteProps) {
  const { projectId } = useParams();
  const { hasAccess, loading, assignments } = useProjectAccess(projectId);

  useEffect(() => {
    console.log('🛡️ ProtectedProjectRoute State:', {
      projectId,
      loading,
      hasAccess,
      assignmentsCount: assignments.length
    });
  }, [projectId, loading, hasAccess, assignments]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  if (!hasAccess) {
    console.warn('❌ Access denied to project:', projectId);
    return <ForbiddenError />;
  }

  console.log('✅ Access granted to project:', projectId);
  return <>{children}</>;
}
