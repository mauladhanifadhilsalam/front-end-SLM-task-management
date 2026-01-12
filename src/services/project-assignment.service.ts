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
    userId: Number(a.userId ?? a.user_id ?? a.user?.id),
    assignedAt: String(a.assignedAt ?? a.created_at ?? new Date().toISOString()),
    user: {
      id: Number(a.user?.id ?? a.userId),
      fullName: String(a.user?.fullName ?? a.user?.name ?? a.assigneeName ?? ""),
      email: String(a.user?.email ?? ""),
      role: String(a.user?.role ?? ""),
      projectRole: a.user?.projectRole ?? null,
    },
    project: {
      id: Number(a.project?.id ?? a.projectId),
      name: String(a.project?.name ?? a.projectName ?? ""),
      status: String(a.project?.status ?? ""),
      startDate: String(a.project?.startDate ?? ""),
      endDate: String(a.project?.endDate ?? ""),
    },
    // Legacy fields mapping
    projectName: String(a.project?.name ?? a.projectName ?? ""),
    assigneeName: String(a.user?.fullName ?? a.assigneeName ?? ""),
    roleInProject: (a.user?.projectRole as any) ?? a.roleInProject ?? undefined,
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
