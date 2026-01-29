"use client"

import * as React from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  createTicketSchema,
  type CreateTicketValues,
  type CreateTicketField,
  toCreateTicketPayload,
} from "@/schemas/tickets.schema"
import {
  createTicket,
  fetchTicketFormOptions,
  type TicketFormProjectOption,
  type TicketFormRequesterOption,
} from "@/services/ticket.service"
import { ticketKeys } from "@/lib/query-keys"

type UseCreateTicketFormReturn = {
  form: CreateTicketValues
  fieldErrors: Partial<Record<CreateTicketField, string>>
  projects: TicketFormProjectOption[]
  requesters: TicketFormRequesterOption[]
  loadingOptions: boolean
  saving: boolean
  error: string | null
  handleChange: (field: CreateTicketField, value: string) => void
  handleSubmit: (onSuccess: () => void) => (e: React.FormEvent) => void
}

export function useCreateTicketForm(): UseCreateTicketFormReturn {
  const queryClient = useQueryClient()
  const [projects, setProjects] = React.useState<TicketFormProjectOption[]>([])
  const [requesters, setRequesters] =
    React.useState<TicketFormRequesterOption[]>([])
  const [loadingOptions, setLoadingOptions] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [form, setForm] = React.useState<CreateTicketValues>({
    projectId: 0 as any,
    requesterId: 0 as any,
    type: "" as any,
    title: "",
    description: "",
    priority: "" as any,
    status: "TO_DO",
    startDate: "",
    dueDate: "",
  })

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<CreateTicketField, string>>
  >({})

  React.useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoadingOptions(true)
        const { projects, requesters } = await fetchTicketFormOptions()
        if (mounted) {
          setProjects(projects)
          setRequesters(requesters)
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Gagal memuat data Project/Requester. Pastikan API berjalan & token valid."
        if (mounted) setError(msg)
      } finally {
        if (mounted) setLoadingOptions(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const handleChange = (field: CreateTicketField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as any }))

    if (fieldErrors[field]) {
      const single = (createTicketSchema as any).pick({ [field]: true })
      const forCheck =
        field === "projectId" || field === "requesterId"
          ? Number(value)
          : value
      const res = single.safeParse({ [field]: forCheck })
      setFieldErrors((fe) => ({
        ...fe,
        [field]: res.success ? undefined : res.error.issues[0]?.message,
      }))
    }

    if (field === "startDate" && form.dueDate) {
      const s = new Date(value).getTime()
      const d = new Date(form.dueDate).getTime()
      if (!Number.isNaN(s) && !Number.isNaN(d) && d < s) {
        setForm((prev) => ({ ...prev, dueDate: "" }))
        setFieldErrors((fe) => ({ ...fe, dueDate: undefined }))
      }
    }
  }

  const handleSubmit =
    (onSuccess: () => void) => async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setSaving(true)
      setFieldErrors({})

      const parsed = createTicketSchema.safeParse(form)
      if (!parsed.success) {
        const fe: Partial<Record<CreateTicketField, string>> = {}
        for (const issue of parsed.error.issues) {
          const k = issue.path[0] as CreateTicketField
          if (!fe[k]) fe[k] = issue.message
        }
        setFieldErrors(fe)
        setSaving(false)
        return
      }

      const payload = toCreateTicketPayload(parsed.data)

      try {
        await createTicket(payload)

        await queryClient.invalidateQueries({ queryKey: ticketKeys.all })

        toast.success("Ticket berhasil dibuat", {
          description: "Ticket baru sudah tersimpan.",
        })

        onSuccess()
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Gagal membuat ticket."
        setError(msg)
        toast.error("Gagal membuat ticket", {
          description: msg,
        })
      } finally {
        setSaving(false)
      }
    }

  return {
    form,
    fieldErrors,
    projects,
    requesters,
    loadingOptions,
    saving,
    error,
    handleChange,
    handleSubmit,
  }
}
