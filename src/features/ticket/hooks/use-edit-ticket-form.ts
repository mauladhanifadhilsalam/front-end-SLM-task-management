
"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  editTicketSchema,
  type EditTicketField,
  type EditTicketValues,
  toEditTicketPayload,
} from "@/schemas/tickets.schema"
import {
  fetchTicketById,
  fetchTicketFormOptions,
  updateTicket,
  type TicketFormProjectOption,
  type TicketFormRequesterOption,
} from "@/services/ticket.service"
import type { EditTicketAssigneeTicket } from "@/types/ticket-assignee.type"

const OPTIONS_TTL_MS = 5 * 60 * 1000

export type UiEditTicketForm = {
  projectId: string
  requesterId: string
  type: "" | "ISSUE" | "TASK"
  title: string
  description: string
  priority: "" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  status:
    | ""
    | "NEW"
    | "TO_DO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "DONE"
    | "RESOLVED"
    | "CLOSED"
  startDate: string
  dueDate: string
}

type UseEditTicketFormReturn = {
  form: UiEditTicketForm
  fieldErrors: Partial<Record<EditTicketField, string>>
  projects: TicketFormProjectOption[]
  requesters: TicketFormRequesterOption[]
  loading: boolean
  loadingOptions: boolean
  saving: boolean
  error: string | null
  handleChange: (field: keyof UiEditTicketForm, value: string) => void
  handleSubmit: (e: React.FormEvent, onSuccess: () => void) => void
}

const toLocalInput = (iso?: string | null) => {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function useEditTicketForm(ticketId?: string): UseEditTicketFormReturn {
  const [projects, setProjects] = React.useState<TicketFormProjectOption[]>([])
  const [requesters, setRequesters] =
    React.useState<TicketFormRequesterOption[]>([])
  const [loadingOptions, setLoadingOptions] = React.useState(true)

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [form, setForm] = React.useState<UiEditTicketForm>({
    projectId: "",
    requesterId: "",
    type: "",
    title: "",
    description: "",
    priority: "",
    status: "",
    startDate: "",
    dueDate: "",
  })

  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<EditTicketField, string>>
  >({})

  React.useEffect(() => {
    try {
      const cached = localStorage.getItem("options_cache")
      if (!cached) return
      const parsed = JSON.parse(cached)
      const age = Date.now() - Number(parsed.ts ?? 0)
      if (age < OPTIONS_TTL_MS) {
        setProjects(parsed.projects ?? [])
        setRequesters(parsed.requesters ?? [])
        setLoadingOptions(false)
      }
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const { projects, requesters } = await fetchTicketFormOptions()
        if (!active) return
        setProjects(projects)
        setRequesters(requesters)
        localStorage.setItem(
          "options_cache",
          JSON.stringify({ projects, requesters, ts: Date.now() }),
        )
      } catch {
      } finally {
        if (active) setLoadingOptions(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => {
    if (!ticketId) {
      setLoading(false)
      setError("Ticket ID tidak ditemukan.")
      return
    }

    let active = true

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const t = (await fetchTicketById(
          ticketId,
        )) as EditTicketAssigneeTicket

        if (!active) return

        setForm({
          projectId: String(t.projectId ?? ""),
          requesterId: String(t.requesterId ?? ""),
          type: (t.type ?? "") as UiEditTicketForm["type"],
          title: t.title ?? "",
          description: t.description ?? "",
          priority: (t.priority ?? "") as UiEditTicketForm["priority"],
          status: (t.status ?? "") as UiEditTicketForm["status"],
          startDate: toLocalInput(t.startDate ?? null),
          dueDate: toLocalInput(t.dueDate ?? null),
        })
      } catch (err: any) {
        if (!active) return
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Gagal memuat ticket.",
        )
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [ticketId])

  const handleChange = (field: keyof UiEditTicketForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (fieldErrors[field as EditTicketField]) {
      const single = (editTicketSchema as any).pick({ [field]: true })
      const forCheck =
        field === "projectId" || field === "requesterId"
          ? Number(value)
          : value
      const res = single.safeParse({ [field]: forCheck })

      setFieldErrors((fe) => ({
        ...fe,
        [field as EditTicketField]: res.success
          ? undefined
          : res.error.issues[0]?.message,
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

  const handleSubmit = async (
    e: React.FormEvent,
    onSuccess: () => void,
  ): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    setFieldErrors({})

    if (!ticketId) {
      setError("Ticket ID tidak ditemukan.")
      setSaving(false)
      return
    }

    const parsed = editTicketSchema.safeParse({
      projectId: form.projectId,
      requesterId: form.requesterId,
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      startDate: form.startDate,
      dueDate: form.dueDate,
    })

    if (!parsed.success) {
      const fe: Partial<Record<EditTicketField, string>> = {}
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as EditTicketField
        if (!fe[k]) fe[k] = issue.message
      }
      setFieldErrors(fe)

      toast.warning("Form ticket belum valid", {
        description:
          "Periksa kembali project, requester, type, priority, status, dan tanggal.",
      })

      setSaving(false)
      return
    }

    const payload = toEditTicketPayload(parsed.data as EditTicketValues)

    try {
      await updateTicket(ticketId, payload)
      toast.success("Perubahan ticket disimpan", {
        description: "Update ticket berhasil tersimpan.",
      })
      onSuccess()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Gagal menyimpan perubahan."
      setError(msg)
      toast.error("Gagal menyimpan ticket", {
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
    loading,
    loadingOptions,
    saving,
    error,
    handleChange,
    handleSubmit,
  }
}
