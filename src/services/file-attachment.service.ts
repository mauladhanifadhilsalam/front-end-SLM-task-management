import type { Attachment } from "@/types/file-attachment.type"
import { extractArrayFromApi } from "@/utils/api-response.util"
import { api } from "@/lib/api"

const API_BASE = import.meta.env.VITE_API_BASE

type AttachmentApi = {
  id: number
  ticketId?: number
  userId?: number
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: string
  base64?: string
  user?: {
    id: number
    fullName: string
    email?: string
  }
}

const buildFileUrl = (filePath?: string) => {
  if (!filePath) return undefined
  if (filePath.startsWith("http")) return filePath
  if (filePath.startsWith("/")) return `${API_BASE}${filePath}`
  return `${API_BASE}/attachments/${filePath}`
}

const normalizeAttachment = (a: AttachmentApi): Attachment => {
  return {
    id: a.id,
    fileName: a.fileName,
    mimeType: a.mimeType,
    size: a.fileSize,
    url: buildFileUrl(a.filePath),
    base64: a.base64,
    createdAt: a.createdAt,
    ticketId: a.ticketId,
    uploader: a.user
      ? {
          id: a.user.id,
          fullName: a.user.fullName,
          email: a.user.email,
        }
      : undefined,
  }
}

export const fetchFileAttachments = async (): Promise<Attachment[]> => {
  const { data } = await api.get<AttachmentApi[]>(`/attachments`)

  return extractArrayFromApi<AttachmentApi>(data, [
    "attachments",
  ]).map(normalizeAttachment)
}

export const deleteFileAttachmentById = async (id: number): Promise<void> => {
  await api.delete(`/attachments/${id}`)
}

export type AttachmentTicketOption = {
  value: string
  label: string
}

type TicketApi = {
  id: number
  title?: string
  subject?: string
  code?: string
}

export const fetchAttachmentTicketOptions =
  async (): Promise<AttachmentTicketOption[]> => {
    const { data } = await api.get<TicketApi[]>(`/tickets`)

    const tickets = extractArrayFromApi<TicketApi>(data, [
      "tickets",
    ])
    return tickets.map((t) => {
      const title = t.title || t.subject || t.code || `Ticket #${t.id}`
      return { value: String(t.id), label: `${title} (#${t.id})` }
    })
  }

export const uploadFileAttachment = async (
  ticketId: string,
  file: File,
  onProgress?: (p: number) => void,
): Promise<void> => {
  const fd = new FormData()
  fd.append("ticketId", ticketId)
  fd.append("file", file)

  await api.post(`/attachments`, fd, {
    onUploadProgress: (pe) => {
      if (!pe.total || !onProgress) return
      const pct = Math.round((pe.loaded * 100) / pe.total)
      onProgress(pct)
    },
  })
}
