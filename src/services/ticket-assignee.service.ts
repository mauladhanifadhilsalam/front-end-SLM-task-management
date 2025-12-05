import axios from "axios"
import type {
  TicketAssignee,
  TicketStatus,
  TicketPriority,
  TicketType,
} from "@/types/ticket-assignee.type"
import { getAuthHeaders } from "@/utils/auth-header.util"
import { extractArrayFromApi } from "@/utils/api-response.util"

const API_BASE = import.meta.env.VITE_API_BASE as string

type RawTicket = {
  id: number
  title?: string
  description?: string | null
  status?: string
  priority?: string
  type?: string
  createdAt?: string
  assignees?: any[]
}

const normalizeStatus = (raw?: string): TicketStatus => {
  const value = (raw ?? "OPEN").toUpperCase()
  switch (value) {
    case "OPEN":
      return "OPEN"
    case "IN_PROGRESS":
      return "IN_PROGRESS"
    case "RESOLVED":
      return "RESOLVED"
    case "CLOSED":
      return "CLOSED"
    case "PENDING":
      return "PENDING"
    default:
      return "OPEN"
  }
}

const normalizePriority = (raw?: string): TicketPriority => {
  const value = (raw ?? "LOW").toUpperCase()
  switch (value) {
    case "LOW":
      return "LOW"
    case "MEDIUM":
      return "MEDIUM"
    case "HIGH":
      return "HIGH"
    case "URGENT":
      return "URGENT"
    default:
      return "LOW"
  }
}

const normalizeType = (raw?: string): TicketType => {
  const value = (raw ?? "TASK").toUpperCase()
  switch (value) {
    case "TASK":
      return "TASK"
    case "ISSUE":
      return "ISSUE"
    case "BUG":
      return "BUG"
    default:
      return "TASK"
  }
}

const mapTicketAssignees = (tickets: RawTicket[]): TicketAssignee[] => {
  const list: TicketAssignee[] = []

  tickets.forEach((ticket) => {
    if (!Array.isArray(ticket.assignees) || ticket.assignees.length === 0) {
      return
    }

    ticket.assignees.forEach((assignee: any) => {
      const user = assignee.user ?? {}

      list.push({
        id: Number(assignee.id),
        ticketId: Number(ticket.id),
        userId: Number(user.id),
        ticket: {
          id: Number(ticket.id),
          title: String(ticket.title ?? ""),
          description:
            typeof ticket.description === "string"
              ? ticket.description
              : null,
          status: normalizeStatus(ticket.status),
          priority: normalizePriority(ticket.priority),
          type: normalizeType(ticket.type),
        },
        user: {
          id: Number(user.id ?? 0),
          fullName: String(user.fullName ?? user.name ?? ""),
          email: String(user.email ?? ""),
        },
        createdAt:
          String(
            assignee.createdAt ??
              assignee.created_at ??
              ticket.createdAt,
          ) || new Date().toISOString(),
      })
    })
  })

  return list
}

export const fetchTicketAssignees = async (): Promise<TicketAssignee[]> => {
  const res = await axios.get(`${API_BASE}/tickets`, {
    headers: getAuthHeaders(),
  })

  const data = extractArrayFromApi<RawTicket>(res.data, ["tickets"])
  const list = mapTicketAssignees(data)

  list.sort((a, b) => b.id - a.id)

  return list
}

export const deleteTicketAssignee = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/ticket-assignees/${id}`, {
    headers: getAuthHeaders(),
  })
}

export const createTicketAssignees = async (
  ticketId: number,
  userIds: number[],
) => {
  const headers = getAuthHeaders()
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login ulang.")
  }

  for (const userId of userIds) {
    const payload = { ticketId, userId }

    await axios.post(`${API_BASE}/ticket-assignees`, payload, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    })
  }
}
