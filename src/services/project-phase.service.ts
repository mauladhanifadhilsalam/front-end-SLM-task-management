import axios from "axios"
import { ProjectPhaseForm } from "@/types/project.type"

const API_BASE = import.meta.env.VITE_API_BASE

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

export type EditProjectPhaseForm = ProjectPhaseForm & {
  id?: number
}

export const deleteProjectPhase = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/project-phases/${id}`, {
    headers: getAuthHeaders(),
  })
}

export type UpsertPhasePayload = {
  id?: number
  name: string
  startDate: string
  endDate: string
  projectId: number
}

export const upsertProjectPhase = async (
  payload: UpsertPhasePayload,
): Promise<void> => {
  const { id, ...body } = payload
  if (id) {
    await axios.patch(`${API_BASE}/project-phases/${id}`, body, {
      headers: getAuthHeaders(),
    })
  } else {
    await axios.post(`${API_BASE}/project-phases`, body, {
      headers: getAuthHeaders(),
    })
  }
}


export const syncProjectPhases = async (
  projectId: number,
  phases: EditProjectPhaseForm[],
  deletedPhaseIds: number[],
): Promise<void> => {
  const headers = getAuthHeaders()

  for (const delId of deletedPhaseIds) {
    try {
      await axios.delete(`${API_BASE}/project-phases/${delId}`, {
        headers,
      })
    } catch (err) {

      console.error(`Failed to delete phase ${delId}`, err)
    }
  }

  for (const phase of phases) {
    if (!phase.name.trim() || !phase.startDate || !phase.endDate) {
      continue
    }

    const body = {
      name: phase.name.trim(),
      startDate: phase.startDate.toISOString(),
      endDate: phase.endDate.toISOString(),
      projectId,
    }

    if (phase.id) {
      await axios.patch(`${API_BASE}/project-phases/${phase.id}`, body, {
        headers,
      })
    } else {
      await axios.post(`${API_BASE}/project-phases`, body, {
        headers,
      })
    }
  }
}
