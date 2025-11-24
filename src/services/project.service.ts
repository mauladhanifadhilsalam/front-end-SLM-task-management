import axios from "axios"
import { Project, ProjectOwnerLite, ProjectStatus, CreateProjectPayload , ProjectDetail , UpdateProjectPayload  } from "@/types/project.type"

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
  }
}

export const fetchProjects = async (): Promise<Project[]> => {
    const res = await axios.get(`${API_BASE}/projects`, {
        headers: getAuthHeaders(),
    })

    const data: any[] = Array.isArray(res.data) ? res.data : res.data?.data || []
    return data.map(normalizeProject)
}

export const deleteProjectById = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/projects/${id}`, {
        headers: getAuthHeaders(),
    })
}

export const getProjectOwners = async (): Promise<ProjectOwnerLite[]> => {
    const res = await axios.get(`${API_BASE}/project-owners`, {
        headers: getAuthHeaders(),
    })

    const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []

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
  const d = res.data?.data ?? res.data

  const base = normalizeProject(d)

  const phases = (d.phases ?? []).map((p: any) => ({
    id: Number(p.id),
    name: String(p.name ?? ""),
    startDate: String(p.startDate ?? p.start_date ?? ""),
    endDate: String(p.endDate ?? p.end_date ?? ""),
  }))

  return {
    ...base,
    phases,
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