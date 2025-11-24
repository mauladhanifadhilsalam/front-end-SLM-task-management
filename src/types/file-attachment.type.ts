export type AttachmentUploader = {
  id: number
  fullName: string
  email?: string
}

export type Attachment = {
  id: number
  fileName: string
  mimeType: string
  size?: number
  url?: string
  base64?: string
  createdAt?: string
  ticketId?: number
  uploader?: AttachmentUploader
}
