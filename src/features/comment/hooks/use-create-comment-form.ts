import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { createCommentSchema } from "@/schemas/comments.schema"
import { fetchTicketsLite } from "@/services/ticket.service"
import { createComment } from "@/services/comments.service"
import type { TicketLite } from "@/types/ticket-type"
import type { CreateCommentPayload } from "@/types/comment.type"

export type CreateCommentField = "ticketId" | "message"

type CreateCommentFormState = {
  ticketId: string
  message: string
}

type FieldErrors = Partial<Record<CreateCommentField, string>>

export const useCreateCommentForm = () => {
  const navigate = useNavigate()

  const [form, setForm] = React.useState<CreateCommentFormState>({
    ticketId: "",
    message: "",
  })

  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [tickets, setTickets] = React.useState<TicketLite[]>([])
  const [ticketsLoading, setTicketsLoading] = React.useState(false)
  const [ticketsError, setTicketsError] = React.useState<string | null>(null)
  const [comboboxOpen, setComboboxOpen] = React.useState(false)

  const loadTickets = React.useCallback(async () => {
    setTicketsLoading(true)
    setTicketsError(null)

    try {
      const list = await fetchTicketsLite()
      setTickets(list)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to load tickets"
      setTicketsError(msg)
    } finally {
      setTicketsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleChange = (field: CreateCommentField, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (fieldErrors[field]) {
      const singleSchema = (createCommentSchema as any).pick({
        [field]: true,
      })

      const normalized =
        field === "ticketId"
          ? { [field]: Number(value || NaN) }
          : { [field]: value }

      const res = singleSchema.safeParse(normalized)

      setFieldErrors((prev) => ({
        ...prev,
        [field]: res.success ? undefined : res.error.issues[0]?.message,
      }))
    }
  }

  const ticketLabel = React.useMemo(() => {
    const idNum = Number(form.ticketId)
    const t = tickets.find((x) => x.id === idNum)
    if (!t) return ""

    const base = t.title ? t.title : `Ticket #${t.id}`
    const suffix = t.project?.name ? ` — ${t.project?.name}` : ""
    return `#${t.id} · ${base}${suffix}`
  }, [form.ticketId, tickets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    setFieldErrors({})

    const validationInput = {
      ticketId: form.ticketId ? Number(form.ticketId) : form.ticketId,
      message: form.message,
    }

    const parsed = createCommentSchema.safeParse(validationInput)

    if (!parsed.success) {
      const fe: FieldErrors = {}

      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as CreateCommentField
        if (!fe[k]) fe[k] = issue.message
      }

      setFieldErrors(fe)
      setSaving(false)
      return
    }

    const payload: CreateCommentPayload = {
      ticketId: Number(form.ticketId),
      message: form.message,
    }

    try {
      await createComment(payload)

      toast.success("Comment created successfully", {
        description: "Your comment has been saved.",
      })

      navigate("/admin/dashboard/comments")
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to create comment"
      setError(msg)
      toast.error("Failed to create comment", {
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
    form,
    fieldErrors,
    saving,
    error,
    tickets,
    ticketsLoading,
    ticketsError,
    comboboxOpen,
    setComboboxOpen,
    ticketLabel,
    handleChange,
    handleSubmit,
    handleCancel,
  }
}
