
import type { UserLite } from "@/types/user.types"
import type { RoleInProject } from "@/types/project-assignment.type"

export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "ON_HOLD" | "DONE"

export type ProjectOwnerLite = {
  id: number
  name: string
  company: string
  email: string
}

export type ProjectPhasePayload = {
  name: string
  startDate?: string
  endDate?: string
}

export type ProjectAssignmentPayload = {
  userId: number
  roleInProject: RoleInProject
}

export type Project = {
  id: number
  name: string
  categories: string[]
  ownerId: number
  owner?: ProjectOwnerLite | null
  startDate: string
  endDate: string
  status: ProjectStatus
  completion: number
  notes: string
  phases: ProjectPhase[]
}

export type CreateProjectPayload = {
  name: string
  categories: string[]
  ownerId: number
  startDate: string
  endDate: string
  status: string
  completion: number
  notes: string
  phases: ProjectPhasePayload[]
  assignments?: ProjectAssignmentPayload[]
}


export type ProjectPhaseForm = {
  name: string
  startDate?: Date
  endDate?: Date
}

export type ProjectAssignmentForm = {
  userId: number
  roleInProject: string
}


export type ProjectPhase = {
  id: number
  name: string
  startDate: string
  endDate: string
}


export type ProjectAssignment = {
  id: number
  userId: number
  roleInProject: RoleInProject
  isActive?: boolean | null
  allocation?: number | null
  notes?: string | null
  user?: UserLite
}

export type ProjectDetail = Project & {
  phases: ProjectPhase[]
  assignments?: ProjectAssignment[]
}

export type UpdateProjectPayload = {
  name: string
  categories: string[]
  ownerId: number
  startDate: string
  endDate: string
  completion: number
  status: string
  notes?: string
}
