export type ActivityTargetType =
  | "USER"
  | "PROJECT"
  | "TICKET"
  | "COMMENT"
  | "ATTACHMENT"
  | "NOTIFICATION"
  | "PROJECT_PHASE"
  | "PROJECT_ASSIGNMENT"
  | "PROJECT_OWNER"

export type ActivityLogUser = {
  id: number
  fullName: string
  email: string
  role: string
}

export type ActivityLog = {
  id: number
  userId: number
  action: string
  targetType: ActivityTargetType
  targetId: number
  details: Record<string, unknown>
  occurredAt: string
  user: ActivityLogUser
}

export type ActivityLogColumns = {
  id: boolean
  action: boolean
  user: boolean
  role: boolean
  targetType: boolean
  targetId: boolean
  details: boolean
  occurredAt: boolean
  actions: boolean
}
