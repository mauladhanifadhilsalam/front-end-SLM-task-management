import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { fetchCommentById, deleteComment } from "@/services/comments.service"
import type { AdminComment } from "@/types/comment.type"

export const useViewComment = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [comment, setComment] = React.useState<AdminComment | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Invalid comment id")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await fetchCommentById(Number(id))
        setComment(data)
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Failed to load comment details"
        setError(msg)
        toast.error("Failed to load comment details", {
          description: msg,
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleBack = () => {
    navigate("/admin/dashboard/comments")
  }

  const handleDelete = async () => {
    if (!comment) return

    setDeleting(true)
    setError(null)

    try {
      await deleteComment(comment.id)

      toast.success("Comment deleted", {
        description: `Comment #${comment.id} has been deleted successfully.`,
      })

      navigate("/admin/dashboard/comments")
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to delete comment"
      setError(msg)
      toast.error("Failed to delete comment", {
        description: msg,
      })
      setDeleting(false)
    }
  }

  return {
    comment,
    loading,
    error,
    deleting,
    handleBack,
    handleDelete,
  }
}
