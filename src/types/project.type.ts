// ⬅️ TAMBAH IMPORT INI DI PALING ATAS
import type { UserLite } from "@/types/user.types"

export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | string

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
  roleInProject: string
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

// ⬇️ DIPAKAI DI FORM (CREATE / EDIT)
export type ProjectPhaseForm = {
  name: string
  startDate?: Date
  endDate?: Date
}

export type ProjectAssignmentForm = {
  userId: number
  roleInProject: string
}

// ⬇️ DATA DARI API (DETAIL PROJECT)
export type ProjectPhase = {
  id: number
  name: string
  startDate: string
  endDate: string
}

// ⬇️ 🔥 BARU: type assignment untuk DETAIL
export type ProjectAssignment = {
  id: number
  userId: number
  roleInProject: string
  isActive?: boolean | null
  allocation?: number | null
  notes?: string | null
  user?: UserLite
}

// ⬇️ 🔥 UPDATE: ProjectDetail sekarang punya phases + assignments
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
