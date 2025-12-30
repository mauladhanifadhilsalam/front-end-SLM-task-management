export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "PENDING"

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export type TicketType = "TASK" | "ISSUE" | "BUG"


export type TicketAssigneeBaseUser = {
  id: number
  fullName: string
  email: string
}



export type TicketAssigneeTicket = {
  id: number
  title: string
  description: string | null
  actionPlan: string
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
}

export type TicketAssigneeUser = TicketAssigneeBaseUser

export type TicketAssignee = {
  id: number
  ticketId: number
  userId: number
  ticket: TicketAssigneeTicket
  user: TicketAssigneeUser
  createdAt: string
}

export type TicketAssigneeColumns = {
  id: boolean
  ticket: boolean
  assignee: boolean
  type: boolean
  priority: boolean
  status: boolean
  createdAt: boolean
  actions: boolean
}

// ==== EDIT TICKET ASSIGNEE ====

export type EditTicketAssigneeUser = TicketAssigneeBaseUser

export type EditTicketAssigneeTicketAssignee = {
  id: number
  user: EditTicketAssigneeUser
}

export type EditTicketAssigneeFormState = {
  status: string
  priority: string
  assigneeIds: number[]
}



export type TicketAssigneeUserDetails = TicketAssigneeBaseUser

export type TicketAssigneeAssignee = {
  id: number
  user: TicketAssigneeUserDetails
}

export type TicketAssigneeTicketDetail = TicketAssigneeTicket & {
  projectId: number
  requesterId: number
  requester?: TicketAssigneeUserDetails
  assignees: TicketAssigneeAssignee[]
  startDate: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export type EditTicketAssigneeTicket = TicketAssigneeTicketDetail
