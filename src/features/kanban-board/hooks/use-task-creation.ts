import { useCallback, useState } from "react"
import { toast } from "sonner"

import type { TaskFormValues } from "../components/task-form"
import { createTicketAssignees } from "@/services/ticket-assignee.service"
import { createTicket } from "@/services/ticket.service"
import { getUserIdFromToken } from "@/utils/token.utils"
import type { TicketStatus } from "@/types/project-tasks.types"
import { useProjectAssignees } from "./use-project-assignees"

type UseTaskCreationArgs = {
  projectId?: string
  refreshTickets: () => Promise<void>
}

export const useTaskCreation = ({ projectId, refreshTickets }: UseTaskCreationArgs) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<TicketStatus>("TO_DO")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assigneeState = useProjectAssignees(projectId)

  const getValidProjectId = useCallback((): number | null => {
    const numericProjectId = Number(projectId)
    if (!projectId || !Number.isFinite(numericProjectId) || numericProjectId <= 0) {
      const msg = "Project ID tidak valid atau tidak ditemukan."
      setError(msg)
      toast.error("Gagal membuka form", { description: msg })
      return null
    }
    return numericProjectId
  }, [projectId])

  const openForm = (status: TicketStatus = "TO_DO") => {
    const numericProjectId = getValidProjectId()
    if (!numericProjectId) return

    setDefaultStatus(status)
    setIsClosing(false)
    setIsFormOpen(true)
  }

  const closeForm = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsFormOpen(false)
      setIsClosing(false)
      setError(null)
    }, 180)
  }, [])

  const handleSubmit = useCallback(
    async (values: TaskFormValues) => {
      const numericProjectId = getValidProjectId()
      if (!numericProjectId) return

      setSubmitting(true)
      setError(null)

      try {
        const token = localStorage.getItem("token") || ""
        const requesterId = getUserIdFromToken(token) ?? undefined

        const payload = {
          projectId: numericProjectId,
          requesterId,
          type: "TASK",
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
          status: values.status,
          startDate: new Date(values.startDate).toISOString(),
          dueDate: new Date(values.dueDate).toISOString(),
        }

        const newTicket = await createTicket(payload)
        const newTicketId = Number(
          (newTicket as any)?.id ??
            (newTicket as any)?.data?.id ??
            (newTicket as any)?.ticket?.id
        )

        if (Array.isArray(values.assigneeIds) && values.assigneeIds.length > 0 && Number.isFinite(newTicketId)) {
          const ids = values.assigneeIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
          if (ids.length > 0) {
            await createTicketAssignees(newTicketId, ids)
          }
        }

        await refreshTickets()

        toast.success("Task berhasil dibuat", {
          description: values.title,
        })
        closeForm()
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Gagal membuat task."
        setError(msg)
        toast.error("Gagal membuat task", {
          description: msg,
        })
      } finally {
        setSubmitting(false)
      }
    },
    [closeForm, getValidProjectId, refreshTickets]
  )

  return {
    assignees: assigneeState.assignees,
    loadingAssignees: assigneeState.loading,
    assigneeError: assigneeState.error,
    refreshAssignees: assigneeState.refresh,
    isFormOpen,
    isClosing,
    defaultStatus,
    submitting,
    error,
    projectIdError: error,
    openForm,
    closeForm,
    handleSubmit,
  }
}
