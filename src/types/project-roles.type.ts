export interface ProjectRole {
  id: number
  code: string
  name: string
}

export interface CreateProjectRolePayload {
  code: string
  name: string
}

export interface EditProjectRolePayload {
  code?: string
  name?: string
}
