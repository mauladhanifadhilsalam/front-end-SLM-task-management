"use client"

import * as React from "react"
import { toast } from "sonner"
import type { Attachment } from "@/types/file-attachment.type"
import {
  fetchFileAttachments,
  deleteFileAttachmentById,
} from "@/services/file-attachment.service"
import { getAttachmentFileSrc } from "@/utils/attachment-utils"

type UseAdminFileAttachmentsResult = {
  attachments: Attachment[]
  loading: boolean
  error: string | null
  previewOpen: boolean
  previewItem: Attachment | null
  openPreview: (att: Attachment) => void
  closePreview: () => void
  handleDelete: (id: number) => Promise<void>
  handleDownload: (att: Attachment) => void
}

export const useAdminFileAttachments =
  (): UseAdminFileAttachmentsResult => {
    const [attachments, setAttachments] = React.useState<Attachment[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [previewOpen, setPreviewOpen] = React.useState(false)
    const [previewItem, setPreviewItem] = React.useState<Attachment | null>(
      null,
    )

    React.useEffect(() => {
      const load = async () => {
        try {
          setLoading(true)
          setError(null)
          const data = await fetchFileAttachments()
          setAttachments(data)
        } catch (err) {
          setError("Gagal memuat daftar attachment.")
        } finally {
          setLoading(false)
        }
      }

      load()
    }, [])

    const openPreview = (att: Attachment) => {
      setPreviewItem(att)
      setPreviewOpen(true)
    }

    const closePreview = () => {
      setPreviewItem(null)
      setPreviewOpen(false)
    }

    const handleDelete = async (id: number) => {
      const target = attachments.find((a) => a.id === id)
      const prev = attachments

      setAttachments((p) => p.filter((a) => a.id !== id))

      try {
        await deleteFileAttachmentById(id)

        toast.success("Attachment dihapus", {
          description: target?.fileName
            ? `File "${target.fileName}" berhasil dihapus.`
            : "File berhasil dihapus.",
        })
      } catch (err) {
        setAttachments(prev)
        const msg = "Gagal menghapus attachment."
        setError(msg)
        toast.error("Gagal menghapus attachment", {
          description: msg,
        })
      }
    }

    const handleDownload = (att: Attachment) => {
      const src = getAttachmentFileSrc(att)
      if (!src) {
        toast.error("Tidak dapat mengunduh file", {
          description: "Sumber file tidak ditemukan.",
        })
        return
      }

      const link = document.createElement("a")
      link.href = src
      link.download = att.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      attachments,
      loading,
      error,
      previewOpen,
      previewItem,
      openPreview,
      closePreview,
      handleDelete,
      handleDownload,
    }
  }
