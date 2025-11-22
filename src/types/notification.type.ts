export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "USER" | string

export type NotificationState = "READ" | "UNREAD" | string

export type NotificationTargetType =
  | "COMMENT"
  | "TICKET"
  | "SYSTEM"
  | "STATUS"
  | "PROJECT"
  | string

export type NotifyStatusType = "PENDING" | "SENT" | "FAILED" | string | null

export type Recipient = {
  id: number
  fullName: string
  email: string
  role: Role
}

export type Notification = {
  id: number
  recipientId: number
  targetType: NotificationTargetType
  targetId: number
  message: string
  subject?: string | null
  emailFrom?: string | null
  emailReplyTo?: string | null
  state: NotificationState
  createdAt: string
  readAt: string | null
  status: NotifyStatusType
  sentAt: string | null
  emailError: string | null
  recipient?: Recipient
}
