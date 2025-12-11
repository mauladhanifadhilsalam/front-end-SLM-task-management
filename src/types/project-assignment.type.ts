export type RoleInProject =
  | "TECH_LEAD"
  | "FRONT_END"
  | "BACK_END"
  | "DEVOPS"
  | "CLOUD_ENGINEER"

export type ProjectAssignment = {
  id: number
  projectId?: number
  projectName?: string
  assigneeId?: number
  assigneeName?: string
  roleInProject?: RoleInProject
  assignedAt?: string
}

export type ProjectLite = {
  id: number
  name: string
}

export type UserLite = {
  id: number
  fullName: string
  email?: string
}

export type CreateProjectAssignmentPayload = {
  projectId: number
  userId: number
  roleInProject: RoleInProject
  assignedAt?: string
}
