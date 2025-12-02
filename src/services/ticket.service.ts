import axios from "axios"
import type { TicketLite, AdminTicket, TicketDetail } from "@/types/ticket-type"
import { getAuthHeaders } from "@/utils/auth-header.util"
import type { EditTicketAssigneeTicket } from "@/types/ticket-assignee.type"

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

const normalizeArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.tickets)) return raw.tickets
  if (Array.isArray(raw?.data?.items)) return raw.data.items
  if (Array.isArray(raw?.data?.tickets)) return raw.data.tickets
  if (raw && typeof raw === "object") return [raw]
  return []
}

export const fetchTicketsLite = async (): Promise<TicketLite[]> => {
  const res = await axios.get(`${API_BASE}/tickets`, {
    headers: getAuthHeaders(),
  })

  const arr = normalizeArray(res?.data)

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

  return res.data
}

export async function updateTicketStatusAndPriority(
  id: number | string,
  payload: { status: string; priority: string },
): Promise<void> {
  await axios.patch(`${API_BASE}/tickets/${id}`, payload, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  })
}

export async function deleteTicket(id: number | string): Promise<void> {
  await axios.delete(`${API_BASE}/tickets/${id}`, {
    headers: getAuthHeaders(),
  })
}

// ✅ map Ticket API → AdminTicket (sekarang termasuk assigneeIds)
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

export async function fetchTicketFormOptions(): Promise<{
  projects: TicketFormProjectOption[]
  requesters: TicketFormRequesterOption[]
}> {
  const headers = getAuthHeaders()

  const [projRes, userRes] = await Promise.all([
    axios.get(`${API_BASE}/projects`, { headers }),
    axios.get(`${API_BASE}/users`, { headers }),
  ])

  const projRaw: any[] = Array.isArray(projRes.data)
    ? projRes.data
    : projRes.data?.data ?? []

  const userRaw: any[] = Array.isArray(userRes.data)
    ? userRes.data
    : userRes.data?.data ?? []

  const projects: TicketFormProjectOption[] = projRaw.map((p) => ({
    id: Number(p.id ?? p.projectId ?? 0),
    name: String(p.name ?? p.projectName ?? `Project #${p.id}`),
  }))

  const requesters: TicketFormRequesterOption[] = userRaw.map((u) => ({
    id: Number(u.id ?? u.userId ?? 0),
    name: String(u.fullName ?? u.name ?? u.email ?? `User #${u.id}`),
  }))

  return { projects, requesters }
}

export const fetchAdminTickets = async (): Promise<AdminTicket[]> => {
  const res = await axios.get(`${API_BASE}/tickets`, {
    headers: getAuthHeaders(),
  })

  const raw: RawTicket[] = Array.isArray(res.data)
    ? res.data
    : res.data?.data ?? []

  return raw.map(mapTicket)
}

export async function createTicket(payload: any): Promise<any> {
  const res = await axios.post(`${API_BASE}/tickets`, payload, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  })

  return res?.data?.data ?? res?.data
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

  const t = res.data?.data ?? res.data

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
    assignees: Array.isArray(t.assignees) ? t.assignees : [],
  }

  return ticket
}
