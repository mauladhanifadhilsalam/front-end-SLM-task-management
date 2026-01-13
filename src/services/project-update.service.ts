import { api } from "@/lib/api"
import { extractArrayFromApi } from "@/utils/api-response.util"
import { cleanQueryParams } from "@/utils/query-param.util"
import {
  defaultPaginationMeta,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination"
import type {
  ProjectUpdate,
  ProjectUpdateListParams,
} from "@/types/project-update.type"
import type { CreateProjectUpdatePayload, EditProjectUpdatePayload } from "@/types/project-update.type"

export type { ProjectUpdateListParams }

const mapProjectUpdate = (item: any): ProjectUpdate => ({
  id: Number(item?.id ?? 0),
  projectId: Number(item?.projectId ?? item?.project_id ?? 0),
  phaseId: Number(item?.phaseId ?? item?.phase_id ?? 0),
  facilitatorId: Number(item?.facilitatorId ?? item?.facilitator_id ?? 0),
  reportDate: String(item?.reportDate ?? item?.report_date ?? ""),
  participant: String(item?.participant ?? ""),
  progressHighlight: String(
    item?.progressHighlight ?? item?.progress_highlight ?? "",
  ),
  objective: String(item?.objective ?? ""),
  teamMood: String(item?.teamMood ?? item?.team_mood ?? ""),
  createdAt: String(item?.createdAt ?? item?.created_at ?? ""),
  updatedAt: String(item?.updatedAt ?? item?.updated_at ?? ""),
  facilitator: item?.facilitator
    ? {
        id: Number(item.facilitator?.id ?? 0),
        fullName: String(item.facilitator?.fullName ?? "-"),
        email: String(item.facilitator?.email ?? "-"),
        role: String(item.facilitator?.role ?? "-"),
      }
    : null,
  phase: item?.phase
    ? {
        id: Number(item.phase?.id ?? 0),
        name: String(item.phase?.name ?? "-"),
        startDate: String(item.phase?.startDate ?? item.phase?.start_date ?? ""),
        endDate: String(item.phase?.endDate ?? item.phase?.end_date ?? ""),
      }
    : null,
})

export type ProjectUpdateListResult = {
  updates: ProjectUpdate[]
  pagination: PaginationMeta
}

export const fetchProjectUpdatesWithPagination = async (
  params?: ProjectUpdateListParams,
): Promise<ProjectUpdateListResult> => {
  const { data } = await api.get("/project-updates", {
    params: cleanQueryParams(params),
  })

  const updates = extractArrayFromApi(data, ["data", "projectUpdates"]).map(
    mapProjectUpdate,
  ) as ProjectUpdate[]

  return {
    updates,
    pagination: normalizePagination(
      (data as any)?.pagination,
      defaultPaginationMeta,
    ),
  }
}

export const fetchProjectUpdates = async (
  params?: ProjectUpdateListParams,
): Promise<ProjectUpdate[]> => {
  const { updates } = await fetchProjectUpdatesWithPagination(params)
  return updates
}

export const createProjectUpdate = async (
  payload: CreateProjectUpdatePayload,
): Promise<ProjectUpdate> => {
  const { data } = await api.post("/project-updates", payload)
  const item = (data as any)?.data?.projectUpdate ?? (data as any)?.data?.project_update ?? (data as any)?.data ?? data
  return mapProjectUpdate(item)
}

export const updateProjectUpdate = async (
  id: number,
  payload: EditProjectUpdatePayload,
): Promise<ProjectUpdate> => {
  const { data } = await api.patch(`/project-updates/${id}`, payload)
  const item = (data as any)?.data?.projectUpdate ?? (data as any)?.data?.project_update ?? (data as any)?.data ?? data
  return mapProjectUpdate(item)
}

export const deleteProjectUpdate = async (id: number): Promise<void> => {
  await api.delete(`/project-updates/${id}`)
}

export const fetchProjectUpdateById = async (id: number): Promise<ProjectUpdate> => {
  const { data } = await api.get(`/project-updates/${id}`)
  const item = (data as any)?.data?.projectUpdate ?? (data as any)?.data?.project_update ?? (data as any)?.data ?? data
  return mapProjectUpdate(item)
}
