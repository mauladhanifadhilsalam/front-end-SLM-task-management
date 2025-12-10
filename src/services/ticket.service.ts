import axios from "axios"
import type { TicketLite, AdminTicket, TicketDetail } from "@/types/ticket-type"
import type { EditTicketAssigneeTicket } from "@/types/ticket-assignee.type"
import { getAuthHeaders } from "@/utils/auth-header.util"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"

const API_BASE = import.meta.env.VITE_API_BASE as string

type RawTicket = {
  id: number
  projectId?: number
  project_id?: number
  project?: { id?: number; name?: string }
  type?: string
  title?: string
  description?: string
  priority?: string
  status?: string
  requesterId?: number
  requester_id?: number
  requester?: { id?: number; fullName?: string; name?: string; email?: string }
  requester_name?: string
  requesterEmail?: string
  startDate?: string
  start_date?: string
  dueDate?: string
  due_date?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  project_name?: string

  // ⬇⬇⬇ dari backend kamu (assignees[].user.id)
  assignees?: {
    id?: number
    assignedAt?: string
    user?: {
      id?: number
      fullName?: string
      email?: string
      role?: string
    }
  }[]
}

export const fetchTicketsLite = async (): Promise<TicketLite[]> => {
  const res = await axios.get(`${API_BASE}/tickets`, {
    headers: getAuthHeaders(),
  })

  const arr = extractArrayFromApi(res.data, ["tickets"])

  const list: TicketLite[] = arr.map((t: any) => ({
    id: Number(t.id),
    title: t.title ?? undefined,
    project: t.project
      ? {
          id: Number(t.project.id),
          name: t.project.name ?? undefined,
        }
      : null,
  }))

  list.sort((a, b) => b.id - a.id)
  return list
}

export async function fetchTicketByIdAssignee(
  id: number | string,
): Promise<EditTicketAssigneeTicket> {
  const res = await axios.get(`${API_BASE}/tickets/${id}`, {
    headers: getAuthHeaders(),
  })

  return unwrapApiData<EditTicketAssigneeTicket>(res.data)
}

export async function deleteTicket(id: number | string): Promise<void> {
  await axios.delete(`${API_BASE}/tickets/${id}`, {
    headers: getAuthHeaders(),
  })
}


const mapTicket = (raw: RawTicket): AdminTicket => {
  const assigneeIds =
    Array.isArray(raw.assignees)
      ? raw.assignees
          .map((a) => (a.user?.id != null ? Number(a.user.id) : NaN))
          .filter((id) => Number.isFinite(id))
      : []

  return {
    assigneeIds,

    id: Number(raw.id),
    projectId: Number(
      raw.projectId ?? raw.project_id ?? raw.project?.id ?? 0,
    ),
    type: String(raw.type ?? ""),
    title: String(raw.title ?? ""),
    description: raw.description ?? "",
    priority: raw.priority as AdminTicket["priority"],
    status: (raw.status ?? "TO_DO") as AdminTicket["status"],
    requesterId: Number(
      raw.requesterId ?? raw.requester_id ?? raw.requester?.id ?? 0,
    ),
    startDate: raw.startDate ?? raw.start_date ?? undefined,
    dueDate: raw.dueDate ?? raw.due_date ?? undefined,
    createdAt: raw.createdAt ?? raw.created_at ?? undefined,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? undefined,
    requesterName:
      raw.requester?.fullName ??
      raw.requester?.name ??
      raw.requester_name ??
      raw.requesterEmail ??
      "",
    projectName: raw.project?.name ?? raw.project_name ?? "",
  }
}

export type TicketFormProjectOption = {
  id: number
  name: string
}

export type TicketFormRequesterOption = {
  id: number
  name: string
}

type TicketFormOptionsParams = {
  includeRequesters?: boolean
}

export async function fetchTicketFormOptions(
  params: TicketFormOptionsParams = {},
): Promise<{
  projects: TicketFormProjectOption[]
  requesters: TicketFormRequesterOption[]
}> {
  const { includeRequesters = true } = params
  const headers = getAuthHeaders()

  const projectPromise = axios.get(`${API_BASE}/projects`, { headers })
  const requesterPromise = includeRequesters
    ? axios.get(`${API_BASE}/users`, { headers })
    : null

  const projRes = await projectPromise
  const projRaw: any[] = extractArrayFromApi(projRes.data, ["projects"])

  const projects: TicketFormProjectOption[] = projRaw.map((p) => ({
    id: Number(p.id ?? p.projectId ?? 0),
    name: String(p.name ?? p.projectName ?? `Project #${p.id}`),
  }))

  let requesters: TicketFormRequesterOption[] = []

  if (includeRequesters && requesterPromise) {
    const userRes = await requesterPromise
    const userRaw: any[] = extractArrayFromApi(userRes.data, ["users"])

    requesters = userRaw.map((u) => ({
      id: Number(u.id ?? u.userId ?? 0),
      name: String(u.fullName ?? u.name ?? u.email ?? `User #${u.id}`),
    }))
  }

  return { projects, requesters }
}

export const fetchAdminTickets = async (): Promise<AdminTicket[]> => {
  const res = await axios.get(`${API_BASE}/tickets`, {
    headers: getAuthHeaders(),
  })

  const raw: RawTicket[] = extractArrayFromApi<RawTicket>(res.data, [
    "tickets",
  ])

  return raw.map(mapTicket)
}

export async function createTicket(payload: any): Promise<any> {
  const res = await axios.post(`${API_BASE}/tickets`, payload, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  })

  return unwrapApiData(res.data)
}

export async function updateTicket(
  id: number | string,
  payload: any,
): Promise<void> {
  await axios.patch(`${API_BASE}/tickets/${id}`, payload, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  })
}

export async function fetchTicketById(
  id: number | string,
): Promise<TicketDetail> {
  const res = await axios.get(`${API_BASE}/tickets/${id}`, {
    headers: getAuthHeaders(),
  })

  const t = unwrapApiData<RawTicket>(res.data)
  const normalizedAssignees: TicketDetail["assignees"] = Array.isArray(
    t.assignees,
  )
    ? t.assignees.map((assignee: any) => ({
        id: Number(assignee.id ?? 0),
        assignedAt:
          typeof assignee.assignedAt === "string"
            ? assignee.assignedAt
            : assignee.assigned_at ?? undefined,
        user: assignee.user
          ? {
              id: Number(assignee.user.id ?? 0),
              fullName: assignee.user.fullName ?? undefined,
              name: assignee.user.name ?? undefined,
              email: assignee.user.email ?? undefined,
              role: assignee.user.role ?? undefined,
            }
          : undefined,
      }))
    : []

  const ticket: TicketDetail = {
    id: Number(t.id),
    projectId: Number(t.projectId ?? t.project_id ?? t.project?.id ?? 0),
    requesterId: Number(t.requesterId ?? t.requester_id ?? t.requester?.id ?? 0),
    type: String(t.type ?? ""),
    title: String(t.title ?? ""),
    description: t.description ?? null,
    priority: t.priority ?? null,
    status: String(t.status ?? "TO_DO"),
    startDate: t.startDate ?? t.start_date ?? null,
    dueDate: t.dueDate ?? t.due_date ?? null,
    createdAt: t.createdAt ?? t.created_at ?? null,
    updatedAt: t.updatedAt ?? t.updated_at ?? null,
    requesterName:
      t.requester?.fullName ??
      t.requester?.name ??
      t.requester_name ??
      t.requesterEmail ??
      undefined,
    projectName: t.project?.name ?? t.project_name ?? undefined,
    assignees: normalizedAssignees,
  }

  return ticket
}
