import axios from "axios"
import type { TicketLite } from "@/types/ticket-type"
import { getAuthHeaders } from "@/utils/auth-header.util"
import type { EditTicketAssigneeTicket } from "@/types/ticket-assignee.type"
const API_BASE = import.meta.env.VITE_API_BASE as string



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

export async function fetchTicketById(
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
