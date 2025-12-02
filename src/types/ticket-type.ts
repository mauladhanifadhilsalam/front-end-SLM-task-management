export type TicketType = "TASK" | "ISSUE" | "BUG"
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type TicketStatus =
  | "NEW"
  | "TO_DO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "RESOLVED"
  | "CLOSED"

export type AdminTicket = {
  assigneeIds: number[]
  id: number
  projectId: number
  requesterId: number
  type: TicketType | string
  title: string
  description?: string
  priority?: TicketPriority | string
  status: TicketStatus | string
  startDate?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  requesterName?: string
  projectName?: string
}

export type AdminTicketColumns = {
  id: boolean
  title: boolean
  type: boolean
  priority: boolean
  status: boolean
  requester: boolean
  project: boolean
  startDate: boolean
  dueDate: boolean
  actions: boolean
}

export type TicketLite = {
  id: number
  title?: string
  project?: {
    id: number
    name?: string
  } | null
}

export type TicketUserLite = {
  id: number
  fullName?: string
  name?: string
  email?: string
  role?: string
}

export type TicketAssignee = {
  id?: number
  assignedAt?: string
  user?: TicketUserLite
}

export type TicketDetail = {
  id: number
  projectId: number
  requesterId: number
  type: TicketType | string
  title: string
  description: string | null
  priority: TicketPriority | string | null
  status: TicketStatus | string
  startDate: string | null
  dueDate: string | null
  createdAt: string | null
  updatedAt: string | null
  requesterName?: string
  projectName?: string
  assignees: TicketAssignee[]
}
