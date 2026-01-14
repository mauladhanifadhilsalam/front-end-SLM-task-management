import { api } from "@/lib/api"
import type { ProjectRole } from "@/types/project-roles.type"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"
import { cleanQueryParams } from "@/utils/query-param.util"
import {
  defaultPaginationMeta,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination"

export type ProjectRoleListParams = {
  search?: string
  page?: number
  pageSize?: number
}

export const emptyProjectRolePagination = { ...defaultPaginationMeta }

export type FetchProjectRolesResult = {
  projectRoles: ProjectRole[]
  pagination: PaginationMeta
}

export const fetchProjectRolesWithPagination = async (
  params?: ProjectRoleListParams,
): Promise<FetchProjectRolesResult> => {
  const { data } = await api.get("/project-roles", {
    params: cleanQueryParams(params),
  })

  const rawList = Array.isArray((data as any)?.data)
    ? ((data as any).data as any[])
    : extractArrayFromApi(data, ["projectRoles"])

  const normalized: ProjectRole[] = rawList.map((r) => ({
    id: Number(r.id),
    code: String(r.code ?? ""),
    name: String(r.name ?? ""),
  }))

  const pagination = normalizePagination(
    (data as any)?.pagination,
    defaultPaginationMeta,
  )

  return {
    projectRoles: normalized,
    pagination,
  }
}

export const fetchProjectRoles = async (
  params?: ProjectRoleListParams,
): Promise<ProjectRole[]> => {
  const { projectRoles } = await fetchProjectRolesWithPagination(params)
  return projectRoles
}

export const fetchProjectRoleByCode = async (
  code: string,
): Promise<ProjectRole> => {
  const { data } = await api.get(`/project-roles/${code}`)
  return unwrapApiData<ProjectRole>(data)
}

export const deleteProjectRoleByCode = async (code: string): Promise<void> => {
  await api.delete(`/project-roles/${code}`)
}

export const createProjectRole = async (
  payload: { code: string; name: string },
): Promise<ProjectRole> => {
  const { data } = await api.post("/project-roles", payload)
  return unwrapApiData<ProjectRole>(data)
}

export const updateProjectRoleByCode = async (
  code: string,
  payload: Partial<{ code: string; name: string }>,
): Promise<void> => {
  await api.patch(`/project-roles/${code}`, payload)
}
