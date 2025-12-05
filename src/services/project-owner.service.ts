import axios from "axios";
import {
  ProjectOwner,
  CreateProjectOwnerPayload,
  UpdateProjectOwnerPayload,
} from "@/types/project-owner.type";
import { array } from "zod";
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util";

const API_BASE = import.meta.env.VITE_API_BASE

const getAuthHeaders = () =>{
    const token = localStorage.getItem('token')
    if(!token) return undefined
    return {
        Authorization: `Bearer ${token}`
    }
}
 
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
  const res = await axios.get(`${API_BASE}/project-owners`, {
    headers: getAuthHeaders(),
  })

  const raw: any[] = extractArrayFromApi(res.data, ["projectOwners"])
  return normalizeProjectOwners(raw)
}

export const deleteProjectOwnerById = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/project-owners/${id}`, {
        headers: getAuthHeaders(),
    })
}

export const createProjectOwner = async (
  payload: CreateProjectOwnerPayload,
): Promise<ProjectOwner | void> => {
  const res = await axios.post(`${API_BASE}/project-owners`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
  return unwrapApiData<ProjectOwner | void>(res.data)
}

export const getProjectOwnerById = async (
  id: string | number,
): Promise<ProjectOwner> => {
  const res = await axios.get(`${API_BASE}/project-owners/${id}`, {
    headers: getAuthHeaders(),
  })
  const d: any = unwrapApiData(res.data)
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
  await axios.patch(`${API_BASE}/project-owners/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
}
