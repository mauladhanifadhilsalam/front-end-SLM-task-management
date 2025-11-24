import type { TicketLite } from "./ticket-type"

export type UserLite = {
  id: number
  fullName?: string
  name?: string
  email?: string
  role?: string
}

export type AdminComment = {
  id: number
  ticketId: number
  userId: number
  message: string
  createdAt: string
  user?: UserLite | null
  ticket?: TicketLite | null
}

export type CreateCommentPayload = {
  ticketId: number
  message: string
}

export type EditCommentPayload = CreateCommentPayload
