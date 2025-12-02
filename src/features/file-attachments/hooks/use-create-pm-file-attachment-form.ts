// src/features/file-attachments/hooks/use-create-pm-file-attachment-form.ts
"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  fileAttachmentSchema,
  type FileAttachmentField,
  type FileAttachmentValues,
} from "@/schemas/file-attachments.schema"
import {
  fetchAttachmentTicketOptions,
  uploadFileAttachment,
  type AttachmentTicketOption,
} from "@/services/file-attachment.service"

// ⬇️ Biar bisa dipakai sama form yang sama
export type FileAttachmentFieldErrors = Partial<
  Record<FileAttachmentField, string>
>

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/jpg",
  "application/pdf",
  "text/plain",
]

export const ACCEPT_FILE_TYPES = ALLOWED_TYPES.join(",")

type UseCreatePmFileAttachmentFormOptions = {
  successPath?: string
  backPath?: string
  initialTicketId?: string   // 👈 penting: dari URL
}

export const useCreatePmFileAttachmentForm = (
  options?: UseCreatePmFileAttachmentFormOptions,
) => {
  const navigate = useNavigate()

  const [ticketOptions, setTicketOptions] = React.useState<
    AttachmentTicketOption[]
  >([])
  const [loadingTickets, setLoadingTickets] = React.useState(false)

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)

  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  // ✅ ticketId di-init sekali dari initialTicketId
  const [form, setForm] = React.useState<FileAttachmentValues>(() => ({
    ticketId: options?.initialTicketId ?? "",
    file: undefined as unknown as File,
  }))

  const [fieldErrors, setFieldErrors] =
    React.useState<FileAttachmentFieldErrors>({})

  const [dragOver, setDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoadingTickets(true)
        setError(null)
        const options = await fetchAttachmentTicketOptions()
        setTicketOptions(options)
      } catch {
        setError("Gagal memuat data ticket.")
      } finally {
        setLoadingTickets(false)
      }
    }

    loadTickets()
  }, [])

  React.useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
    setPreview(null)
  }, [file])

  const setTicketId = React.useCallback((ticketId: string) => {
    setForm((prev) => ({ ...prev, ticketId }))
    setFieldErrors((prev) => ({ ...prev, ticketId: undefined }))
  }, [])

  const handleFilePick = (f: File | null) => {
    if (!f) {
      setFile(null)
      setForm((prev) => ({ ...prev, file: undefined as unknown as File }))
      setFieldErrors((prev) => ({ ...prev, file: undefined }))
      return
    }

    if (f.size > MAX_FILE_SIZE) {
      setFieldErrors((prev) => ({
        ...prev,
        file: "Ukuran file maksimal 5MB.",
      }))
      setFile(null)
      setForm((prev) => ({ ...prev, file: undefined as unknown as File }))
      return
    }

    if (!ALLOWED_TYPES.includes(f.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        file:
          "Tipe file tidak diizinkan. Hanya PNG, JPG, JPEG, WEBP, PDF, atau TXT.",
      }))
      setFile(null)
      setForm((prev) => ({ ...prev, file: undefined as unknown as File }))
      return
    }

    setError(null)
    setFieldErrors((prev) => ({ ...prev, file: undefined }))
    setFile(f)
    setForm((prev) => ({ ...prev, file: f }))
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    handleFilePick(f)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0] || null
    handleFilePick(f)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setForm((prev) => ({ ...prev, file: undefined as unknown as File }))
    setFieldErrors((prev) => ({ ...prev, file: undefined }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const parsed = fileAttachmentSchema.safeParse(form)

    if (!parsed.success) {
      const nextErrors: FileAttachmentFieldErrors = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as FileAttachmentField
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message
        }
      })
      setFieldErrors(nextErrors)
      return
    }

    try {
      setSaving(true)
      setProgress(0)

      await uploadFileAttachment(parsed.data.ticketId, parsed.data.file, (p) =>
        setProgress(p),
      )

      toast.success("Attachment uploaded", {
        description: "Attachment berhasil diunggah.",
      })

      navigate(
        options?.successPath ?? "/project-manager/dashboard/ticket-issue",
      )
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Gagal mengunggah attachment."
      setError(msg)
      toast.error("Failed to upload attachment", {
        description: msg,
      })
    } finally {
      setSaving(false)
      setProgress(0)
    }
  }

  const goBack = () => {
    navigate(options?.backPath ?? "/project-manager/dashboard/ticket-issue")
  }

  return {
    ticketOptions,
    loadingTickets,
    saving,
    error,
    progress,
    file,
    preview,
    form,
    fieldErrors,
    dragOver,
    fileInputRef,
    setTicketId,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
    handleSubmit,
    goBack,
  }
}
