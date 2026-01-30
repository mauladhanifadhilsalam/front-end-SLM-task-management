import { useMemo } from "react";
import { getCurrentUserId } from "@/utils/get-current-user";
import { useDeveloperProjects } from "@/features/DevProject/hook/use-developer-projects";

export function useProjectAccess(projectId: string | number | undefined) {
  const userId = getCurrentUserId();
  const { assignments, loading } = useDeveloperProjects();

  const hasAccess = useMemo(() => {
    if (loading) return false;
    
    if (!projectId || !userId) return false;
    
    const numericProjectId = typeof projectId === 'string' ? parseInt(projectId) : projectId;
    
    if (isNaN(numericProjectId)) return false;
    
    const found = assignments.some(assignment => assignment.projectId === numericProjectId);
    
    
    
    return found;
  }, [projectId, userId, assignments, loading]);

  return {
    hasAccess,
    loading,
    userId,
    assignments,
  };
}

export function useCanAccessProject(projectId: number | undefined) {
  const { hasAccess } = useProjectAccess(projectId);
  return hasAccess;
}
