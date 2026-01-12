export type RoleInProject =
  | "TECH_LEAD"
  | "FRONT_END"
  | "BACK_END"
  | "DEVOPS"
  | "CLOUD_ENGINEER"

export type ProjectAssignmentUser = {
  id: number
  fullName: string
  email: string
  role: string
  projectRole: string | null
}

export type ProjectAssignmentProject = {
  id: number
  name: string
  status: string
  startDate: string
  endDate: string
}

export type ProjectAssignment = {
  id: number
  projectId: number
  userId: number
  assignedAt: string
  user: ProjectAssignmentUser
  project: ProjectAssignmentProject
  // Legacy fields for backward compatibility
  projectName?: string
  assigneeId?: number
  assigneeName?: string
  roleInProject?: RoleInProject
}

export type ProjectLite = {
  id: number
  name: string
}

export type UserLite = {
  id: number
  fullName: string
  email?: string
  projectRole?: string
}

export type CreateProjectAssignmentPayload = {
  projectId: number
  userId: number
}
