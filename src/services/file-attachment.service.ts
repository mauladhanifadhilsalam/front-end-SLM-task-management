import axios from "axios"
import type { Attachment } from "@/types/file-attachment.type"

const API_BASE = import.meta.env.VITE_API_BASE

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

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
  return `${API_BASE}/attchments/${filePath}`
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
  const token = localStorage.getItem("token")
  const res = await axios.get<AttachmentApi[]>(`${API_BASE}/attachments`, {
    headers: getAuthHeaders()
  })

  return res.data.map(normalizeAttachment)
}

export const deleteFileAttachmentById = async (id: number): Promise<void> => {
  const token = localStorage.getItem("token")
  await axios.delete(`${API_BASE}/attachments/${id}`, {
    headers: getAuthHeaders()
  })
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
    const res = await axios.get<TicketApi[]>(`${API_BASE}/tickets`, {
      headers: getAuthHeaders(),
    })

    const tickets = res.data || []
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

  await axios.post(`${API_BASE}/attachments`, fd, {
    headers: getAuthHeaders(),
    onUploadProgress: (pe) => {
      if (!pe.total || !onProgress) return
      const pct = Math.round((pe.loaded * 100) / pe.total)
      onProgress(pct)
    },
  })
}