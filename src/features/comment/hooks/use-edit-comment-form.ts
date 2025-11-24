import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { editCommentSchema } from "@/schemas/comments.schema"
import { fetchCommentById, updateComment } from "@/services/comments.service"

export type EditCommentField = "ticketId" | "message"

type EditCommentFormState = {
  ticketId: string
  message: string
}

type FieldErrors = Partial<Record<EditCommentField, string>>

export const useEditCommentForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [form, setForm] = React.useState<EditCommentFormState>({
    ticketId: "",
    message: "",
  })

  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  React.useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Invalid comment id")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setFieldErrors({})

      try {
        const data = await fetchCommentById(Number(id))
        setForm({
          ticketId: String(
            data.ticketId ??
              data.ticket?.id ??
              0,
          ),
          message: data.message ?? "",
        })
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to load comment"
        setError(msg)
        toast.error("Failed to load comment", {
          description: msg,
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleChange = (field: EditCommentField, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (fieldErrors[field]) {
      const singleSchema = (editCommentSchema as any).pick({
        [field]: true,
      })

      const payload =
        field === "ticketId"
          ? { ticketId: Number(value || NaN) }
          : { [field]: value }

      const res = singleSchema.safeParse(payload)

      setFieldErrors((prev) => ({
        ...prev,
        [field]: res.success ? undefined : res.error.issues[0]?.message,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    setError(null)
    setFieldErrors({})

    const validationInput = {
      ticketId: form.ticketId ? Number(form.ticketId) : form.ticketId,
      message: form.message,
    }

    const parsed = editCommentSchema.safeParse(validationInput)

    if (!parsed.success) {
      const fe: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as EditCommentField
        if (!fe[k]) fe[k] = issue.message
      }
      setFieldErrors(fe)
      setSaving(false)
      return
    }

    try {
      await updateComment(Number(id), {
        ticketId: Number(form.ticketId),
        message: form.message,
      })

      toast.success("Comment updated successfully", {
        description: "Your changes have been saved.",
      })

      navigate("/admin/dashboard/comments")
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to update comment"
      setError(msg)
      toast.error("Failed to update comment", {
        description: msg,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate("/admin/dashboard/comments")
  }

  return {
    loading,
    saving,
    error,
    form,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleCancel,
  }
}
