import {
  ProjectOwner,
  CreateProjectOwnerPayload,
  UpdateProjectOwnerPayload,
} from "@/types/project-owner.type";
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util";
import { api } from "@/lib/api";
 
const normalizeProjectOwners = (raw: any[]): ProjectOwner[] => {
    return raw.map((o) => ({
        id: Number(o.id),
        name: String(o.name ?? ""),
        company: o.company ?? "",
        email: o.email ?? "",
        phone: o.phone ?? "",
        address: o.address ?? "",
        createdAt: o.createdAt ?? o.created_at ?? undefined,
        updatedAt: o.updatedAt ?? o.updated_at ?? undefined,
    }))
}

export const fetchProjectOwners = async (): Promise<ProjectOwner[]> => {
  const { data } = await api.get(`/project-owners`)

  const raw: any[] = extractArrayFromApi(data, ["projectOwners"])
  return normalizeProjectOwners(raw)
}

export const deleteProjectOwnerById = async (id: number): Promise<void> => {
    await api.delete(`/project-owners/${id}`)
}

export const createProjectOwner = async (
  payload: CreateProjectOwnerPayload,
): Promise<ProjectOwner | void> => {
  const { data } = await api.post(`/project-owners`, payload)
  return unwrapApiData<ProjectOwner | void>(data)
}

export const getProjectOwnerById = async (
  id: string | number,
): Promise<ProjectOwner> => {
  const { data } = await api.get(`/project-owners/${id}`)
  const d: any = unwrapApiData(data)
  return {
    id: Number(d.id),
    name: d?.name ?? "",
    company: d?.company ?? "",
    email: d?.email ?? "",
    phone: d?.phone ?? "",
    address: d?.address ?? "",
    createdAt: d?.createdAt ?? d?.created_at ?? undefined,
    updatedAt: d?.updatedAt ?? d?.updated_at ?? undefined,
  }
}



export const updateProjectOwner = async (
  id: string | number,
  payload: UpdateProjectOwnerPayload,
): Promise<void> => {
  await api.patch(`/project-owners/${id}`, payload)
}
