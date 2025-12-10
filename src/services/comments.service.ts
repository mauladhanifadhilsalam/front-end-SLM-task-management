import type {
  AdminComment,
  CreateCommentPayload,
  EditCommentPayload,
} from "@/types/comment.type"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"
import { api } from "@/lib/api"


export const fetchComments = async (): Promise<AdminComment[]> => {
  const { data } = await api.get("/comments")

  const candidate = extractArrayFromApi(data, ["comments"])

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
  await api.delete(`/comments/${id}`)
}

export const createComment = async (
  payload: CreateCommentPayload,
): Promise<void> => {
  await api.post("/comments", payload)
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
  const { data } = await api.get(`/comments/${id}`)
  const parsed = unwrapApiData(data)
  return mapRawComment(parsed ?? {})
}

export const updateComment = async (
  id: number,
  payload: EditCommentPayload,
): Promise<void> => {
  await api.patch(`/comments/${id}`, payload)
}
