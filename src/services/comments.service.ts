import axios from "axios"
import type {
  AdminComment,
  CreateCommentPayload,
  EditCommentPayload,
} from "@/types/comment.type"
import { getAuthHeaders } from "@/utils/auth-header.util"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"
const API_BASE = import.meta.env.VITE_API_BASE as string


export const fetchComments = async (): Promise<AdminComment[]> => {
  const res = await axios.get(`${API_BASE}/comments`, {
    headers: getAuthHeaders(),
  })

  const candidate = extractArrayFromApi(res.data, ["comments"])

  const list: AdminComment[] = candidate.map((c: any): AdminComment => ({
    id: Number(c.id),
    ticketId: Number(c.ticketId ?? c.ticket_id ?? c.ticket?.id ?? 0),
    userId: Number(c.userId ?? c.user_id ?? c.user?.id ?? 0),
    message: String(c.message ?? ""),
    createdAt: String(
      c.createdAt ?? c.created_at ?? new Date().toISOString(),
    ),
    user: c.user
      ? {
          id: Number(c.user.id),
          fullName: c.user.fullName ?? c.user.name ?? undefined,
          name: c.user.name ?? undefined,
          email: c.user.email ?? undefined,
          role: c.user.role ?? undefined,
        }
      : null,
    ticket: c.ticket
      ? {
          id: Number(c.ticket.id),
          title: c.ticket.title ?? undefined,
          project: c.ticket.project
            ? {
                id: Number(c.ticket.project.id),
                name: c.ticket.project.name ?? undefined,
              }
            : null,
        }
      : { id: Number(c.ticketId ?? c.ticket_id ?? 0) },
  }))

  list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return list
}

export const deleteComment = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/comments/${id}`, {
    headers: getAuthHeaders(),
  })
}

export const createComment = async (
  payload: CreateCommentPayload,
): Promise<void> => {
  await axios.post(`${API_BASE}/comments`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
}

const mapRawComment = (c: any): AdminComment => ({
  id: Number(c.id),
  ticketId: Number(c.ticketId ?? c.ticket_id ?? c.ticket?.id ?? 0),
  userId: Number(c.userId ?? c.user_id ?? c.user?.id ?? 0),
  message: String(c.message ?? ""),
  createdAt: String(c.createdAt ?? c.created_at ?? new Date().toISOString()),
  user: c.user
    ? {
        id: Number(c.user.id),
        fullName: c.user.fullName ?? c.user.name ?? undefined,
        name: c.user.name ?? undefined,
        email: c.user.email ?? undefined,
        role: c.user.role ?? undefined,
      }
    : null,
  ticket: c.ticket
    ? {
        id: Number(c.ticket.id),
        title: c.ticket.title ?? undefined,
        project: c.ticket.project
          ? {
              id: Number(c.ticket.project.id),
              name: c.ticket.project.name ?? undefined,
            }
          : null,
      }
    : { id: Number(c.ticketId ?? c.ticket_id ?? 0) },
})

export const fetchCommentById = async (id: number): Promise<AdminComment> => {
  const res = await axios.get(`${API_BASE}/comments/${id}`, {
    headers: getAuthHeaders(),
  })
  const data = unwrapApiData(res.data)
  return mapRawComment(data ?? {})
}

export const updateComment = async (
  id: number,
  payload: EditCommentPayload,
): Promise<void> => {
  await axios.patch(`${API_BASE}/comments/${id}`, payload, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
}
