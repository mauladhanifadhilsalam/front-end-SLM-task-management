import { ProjectPhaseForm } from "@/types/project.type"
import {
  Phase,
  CreateProjectPhasePayload,
  EditProjectPhasePayload,
} from "@/types/project-phases.type"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"
import { api } from "@/lib/api"


export type EditProjectPhaseForm = ProjectPhaseForm & {
  id?: number
}

export const deleteProjectPhase = async (id: number): Promise<void> => {
  await api.delete(`/project-phases/${id}`)
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
    await api.patch(`/project-phases/${id}`, body)
  } else {
    await api.post(`/project-phases`, body)
  }
}


export const syncProjectPhases = async (
  projectId: number,
  phases: EditProjectPhaseForm[],
  deletedPhaseIds: number[],
): Promise<void> => {
  for (const delId of deletedPhaseIds) {
    try {
      await api.delete(`/project-phases/${delId}`)
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
      await api.patch(`/project-phases/${phase.id}`, body)
    } else {
      await api.post(`/project-phases`, body)
    }
  }
}

export const fetchProjectPhases = async (): Promise<Phase[]> => {
  const { data } = await api.get(`/project-phases`);

  return extractArrayFromApi<Phase>(data, ["phases"]);
};

export const createProjectPhase = async (
  payload: CreateProjectPhasePayload,
): Promise<void> => {
  await api.post(`/project-phases`, payload);
};

export const updateProjectPhase = async (
  id: number,
  payload: EditProjectPhasePayload,
): Promise<void> => {
  await api.patch(`/project-phases/${id}`, payload);
};

export const fetchProjectPhaseById = async (id: number): Promise<Phase> => {
  const { data } = await api.get(`/project-phases/${id}`);

  return unwrapApiData<Phase>(data);
};
