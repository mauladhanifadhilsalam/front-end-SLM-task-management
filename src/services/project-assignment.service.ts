import axios from "axios"
import type { ProjectAssignment, CreateProjectAssignmentPayload } from "@/types/project-assignment.type"

const API_BASE = import.meta.env.VITE_API_BASE

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

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
    const res = await axios.get(`${API_BASE}/project-assignments`, {
        headers: getAuthHeaders(),
    })

    const raw: any[] = Array.isArray(res.data) ? res.data : res.data?.data ?? []
    return raw.map(normalizeProjectAssignment)
}

export const deleteProjectAssignmentById = async (
    id: number,
    ): Promise<void> => {
    await axios.delete(`${API_BASE}/project-assignments/${id}`, {
        headers: getAuthHeaders(),
    })
}

export const createProjectAssignment = async (
    payload: CreateProjectAssignmentPayload,
): Promise<void> => {


    await axios.post(`${API_BASE}/project-assignments`, payload, {
        headers: getAuthHeaders(),
    })
}
