export type ProjectUpdateFacilitator = {
  id: number
  fullName: string
  email: string
  role: string
}

export type ProjectUpdatePhase = {
  id: number
  name: string
  startDate: string
  endDate: string
}

export type ProjectUpdate = {
  id: number
  projectId: number
  phaseId: number
  facilitatorId: number
  reportDate: string
  participant: string
  progressHighlight: string
  objective: string
  teamMood: string
  createdAt: string
  updatedAt: string
  facilitator: ProjectUpdateFacilitator | null
  phase: ProjectUpdatePhase | null
}

export type ProjectUpdateListParams = {
  page?: number
  pageSize?: number
  projectId?: number
  phaseId?: number
  facilitatorId?: number
}
