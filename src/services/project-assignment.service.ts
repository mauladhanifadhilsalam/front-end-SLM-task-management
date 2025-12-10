import type {
  ProjectAssignment,
  CreateProjectAssignmentPayload,
} from "@/types/project-assignment.type"
import { extractArrayFromApi } from "@/utils/api-response.util"
import { api } from "@/lib/api"

const normalizeProjectAssignment = (a: any): ProjectAssignment => {
  return {
    id: Number(a.id),
    projectId: Number(a.projectId ?? a.project_id ?? a.project?.id),
    projectName: String(
      a.projectName ?? a.project_name ?? a.project?.name ?? "",
    ),
    assigneeId: Number(
      a.assigneeId ??
        a.userId ??
        a.assignee_id ??
        a.user?.id,
    ),
    assigneeName:
        a.assigneeName ??
        a.assignee_name ??
        a.userName ??
        a.user_name ??
        a.assignee?.fullName ??
        a.user?.fullName ??
        "",
    roleInProject: a.roleInProject ?? a.assignmentRole ?? "",
    assignedAt: a.assignedAt ?? a.created_at,
}
}

export const fetchProjectAssignments = async (): Promise<ProjectAssignment[]> => {
    const { data } = await api.get(`/project-assignments`)

    const raw: any[] = extractArrayFromApi(data, [
        "projectAssignments",
        "assignments",
    ])
    return raw.map(normalizeProjectAssignment)
}

export const deleteProjectAssignmentById = async (
    id: number,
    ): Promise<void> => {
    await api.delete(`/project-assignments/${id}`)
}

export const createProjectAssignment = async (
    payload: CreateProjectAssignmentPayload,
): Promise<void> => {


    await api.post(`/project-assignments`, payload)
}
