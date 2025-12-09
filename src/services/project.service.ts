import axios from "axios"
import {
  Project,
  ProjectOwnerLite,
  ProjectStatus,
  CreateProjectPayload,
  ProjectDetail,
  UpdateProjectPayload,
  ProjectAssignment,
} from "@/types/project.type"

import { RoleInProject } from "@/types/project-assignment.type"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"

const API_BASE = import.meta.env.VITE_API_BASE

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

const normalizeOwner = (raw: any | null | undefined): ProjectOwnerLite | null => {
  if (!raw) return null
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    company: String(raw.company ?? ""),
    email: String(raw.email ?? ""),
  }
}

const normalizeProject = (raw: any): Project => {
  const completionRaw = raw.completion ?? raw.progress ?? 0
  const completion = Number.isNaN(Number(completionRaw))
    ? 0
    : Number(completionRaw)

  const categoriesRaw = raw.categories ?? []
  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw.map((c) => String(c))
    : String(categoriesRaw || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)

  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    categories,
    ownerId: Number(raw.ownerId ?? raw.owner_id ?? 0),
    owner: normalizeOwner(raw.owner),
    startDate: String(raw.startDate ?? raw.start_date ?? ""),
    endDate: String(raw.endDate ?? raw.end_date ?? ""),
    status: (raw.status as ProjectStatus) ?? "NOT_STARTED",
    completion,
    notes: String(raw.notes ?? ""),
     phases: raw.phases ?? [],
  }
}

const parseFileNameFromDisposition = (
  disposition?: string | null,
): string | null => {
  if (!disposition) return null

  const match = disposition.match(
    /filename\\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i,
  )

  const encoded = match?.[1] || match?.[2]
  if (!encoded) return null

  try {
    return decodeURIComponent(encoded)
  } catch {
    return encoded
  }
}

export const fetchProjects = async (): Promise<Project[]> => {
  const res = await axios.get(`${API_BASE}/projects`, {
    headers: getAuthHeaders(),
  })

  const data: any[] = extractArrayFromApi<any>(res.data, ["projects"])
  return data.map(normalizeProject)
}

export const deleteProjectById = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/projects/${id}`, {
    headers: getAuthHeaders(),
  })
}

export const downloadProjectReport = async (): Promise<{
  blob: Blob
  fileName: string
}> => {
  const res = await axios.get<Blob>(`${API_BASE}/projects/report`, {
    headers: getAuthHeaders(),
    responseType: "blob",
  })

  const disposition =
    (res.headers?.["content-disposition"] as string | undefined) ?? ""
  const parsedName =
    parseFileNameFromDisposition(disposition) ?? "projects-report.xlsx"

  return {
    blob: res.data,
    fileName: parsedName,
  }
}

export const getProjectOwners = async (): Promise<ProjectOwnerLite[]> => {
  const res = await axios.get(`${API_BASE}/project-owners`, {
    headers: getAuthHeaders(),
  })

  const raw: any[] = extractArrayFromApi(res.data, ["projectOwners"])

  return raw.map((d) => ({
    id: Number(d.id),
    name: String(d.name ?? ""),
    company: String(d.company ?? ""),
    email: String(d.email ?? ""),
  }))
}

export const createProject = async (
  payload: CreateProjectPayload,
): Promise<void> => {
  await axios.post(`${API_BASE}/projects`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
}

export const fetchProjectById = async (id: number): Promise<ProjectDetail> => {
  const res = await axios.get(`${API_BASE}/projects/${id}`, {
    headers: getAuthHeaders(),
  })
  const d = unwrapApiData<any>(res.data)

  const base = normalizeProject(d)

  const phases = (d.phases ?? []).map((p: any) => ({
    id: Number(p.id),
    name: String(p.name ?? ""),
    startDate: String(p.startDate ?? p.start_date ?? ""),
    endDate: String(p.endDate ?? p.end_date ?? ""),
  }))

  const assignments: ProjectAssignment[] = (d.assignments ?? []).map(
    (a: any) => ({
      roleInProject: String(a.roleInProject ?? a.role_in_project ?? ""),
      user: a.user
        ? {
            id: Number(a.user.id),
            fullName: String(a.user.fullName ?? a.user.full_name ?? ""),
            email: String(a.user.email ?? ""),
          }
        : {
            id: 0,
            fullName: "",
            email: "",
          },
    }),
  )

  return {
    ...base,
    phases,
    assignments,
  }
}

export const updateProject = async (
  id: number,
  payload: UpdateProjectPayload,
): Promise<void> => {
  await axios.patch(`${API_BASE}/projects/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
}

export const addAssignmentToProject = async (
  projectId: number,
  userId: number,
  roleInProject: RoleInProject,
) => {
  return axios.post(
    `${API_BASE}/project-assignments`,
    {
      projectId,    
      userId,       
      roleInProject 
    },
    { headers: getAuthHeaders() },
  )
}

