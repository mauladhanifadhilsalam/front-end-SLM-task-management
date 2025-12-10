export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER"

export type NotificationState = "UNREAD" | "READ"

export type NotificationTargetType = "PROJECT" | "TICKET" | "COMMENT"

export type NotifyStatusType = "SENT" | "PENDING" | "FAILED"

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
