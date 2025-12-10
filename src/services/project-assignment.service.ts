import type {
  ProjectAssignment,
  CreateProjectAssignmentPayload,
} from "@/types/project-assignment.type"
import { extractArrayFromApi } from "@/utils/api-response.util"
import { api } from "@/lib/api"
import { cleanQueryParams } from "@/utils/query-param.util"
import {
  defaultPaginationMeta,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination"

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

export type ProjectAssignmentListParams = {
  projectId?: number
  userId?: number
  roleInProject?: string
  search?: string
  assignedFrom?: string
  assignedTo?: string
  page?: number
  pageSize?: number
}

export type ProjectAssignmentListResult = {
  assignments: ProjectAssignment[]
  pagination: PaginationMeta
}

export const fetchProjectAssignmentsWithPagination = async (
  params?: ProjectAssignmentListParams,
): Promise<ProjectAssignmentListResult> => {
    const { data } = await api.get(`/project-assignments`, {
      params: cleanQueryParams(params),
    })

    const raw: any[] = extractArrayFromApi(data, [
        "projectAssignments",
        "assignments",
    ])
    return {
        assignments: raw.map(normalizeProjectAssignment),
        pagination: normalizePagination(
          (data as any)?.pagination,
          defaultPaginationMeta,
        ),
    }
}

export const fetchProjectAssignments = async (
  params?: ProjectAssignmentListParams,
): Promise<ProjectAssignment[]> => {
    const { assignments } =
        await fetchProjectAssignmentsWithPagination(params)
    return assignments
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
