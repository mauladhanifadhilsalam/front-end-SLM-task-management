"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Attachment } from "@/types/file-attachment.type"
import {
  fetchFileAttachments,
  deleteFileAttachmentById,
} from "@/services/file-attachment.service"
import { getAttachmentFileSrc } from "@/utils/attachment-utils"
import { attachmentKeys } from "@/lib/query-keys"

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
    const queryClient = useQueryClient()
    const [error, setError] = React.useState<string | null>(null)

    const [previewOpen, setPreviewOpen] = React.useState(false)
    const [previewItem, setPreviewItem] = React.useState<Attachment | null>(
      null,
    )

    const attachmentsQuery = useQuery({
      queryKey: attachmentKeys.list(),
      queryFn: fetchFileAttachments,
      staleTime: 60 * 1000,
    })

    const attachments = attachmentsQuery.data ?? []

    React.useEffect(() => {
      if (attachmentsQuery.error) {
        setError("Gagal memuat daftar attachment.")
      } else if (attachmentsQuery.isSuccess) {
        setError(null)
      }
    }, [attachmentsQuery.error, attachmentsQuery.isSuccess])

    const openPreview = (att: Attachment) => {
      setPreviewItem(att)
      setPreviewOpen(true)
    }

    const closePreview = () => {
      setPreviewItem(null)
      setPreviewOpen(false)
    }

    const deleteMutation = useMutation({
      mutationFn: deleteFileAttachmentById,
      onMutate: async (id: number) => {
        await queryClient.cancelQueries({ queryKey: attachmentKeys.list() })
        const previous =
          queryClient.getQueryData<Attachment[]>(
            attachmentKeys.list(),
          ) ?? []

        queryClient.setQueryData<Attachment[]>(
          attachmentKeys.list(),
          (current = []) => current.filter((a) => a.id !== id),
        )

        return { previous }
      },
      onError: (_err, _id, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            attachmentKeys.list(),
            context.previous,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: attachmentKeys.list() })
      },
    })

    const handleDelete = async (id: number) => {
      const target = attachments.find((a) => a.id === id)

      try {
        await deleteMutation.mutateAsync(id)

        toast.success("Attachment dihapus", {
          description: target?.fileName
            ? `File "${target.fileName}" berhasil dihapus.`
            : "File berhasil dihapus.",
        })
      } catch (err) {
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
      loading: attachmentsQuery.isLoading,
      error,
      previewOpen,
      previewItem,
      openPreview,
      closePreview,
      handleDelete,
      handleDownload,
    }
  }
