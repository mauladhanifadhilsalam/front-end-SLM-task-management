import { useCallback, useState } from "react"
import { toast } from "sonner"

import type { TaskFormValues } from "../components/task-form"
import { updateTicket } from "@/services/ticket.service"
import { createTicketAssignees, deleteTicketAssignee } from "@/services/ticket-assignee.service"
import { useProjectAssignees } from "./use-project-assignees"
import type { Ticket } from "@/types/project-tasks.types"

export const useTaskEditor = (projectId?: string, refreshTickets?: () => Promise<void>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const assigneeState = useProjectAssignees(projectId)

  const open = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setIsClosing(false)
    setIsOpen(true)
  }

  const close = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
      setError(null)
      setEditingTicket(null)
    }, 180)
  }, [])

  const handleSubmit = useCallback(
    async (values: TaskFormValues) => {
      if (!editingTicket) return
      const ticketId = editingTicket.id
      setError(null)
      try {
        await updateTicket(ticketId, {
          title: values.title.trim(),
          description: values.description.trim(),
          status: values.status,
          priority: values.priority,
          startDate: new Date(values.startDate).toISOString(),
          dueDate: new Date(values.dueDate).toISOString(),
        })

        const selectedIds = Array.from(
          new Set((values.assigneeIds ?? []).map((id) => Number(id)).filter((n) => Number.isFinite(n))),
        )
        const existingAssignments = editingTicket.assignees ?? []
        const existingIds = existingAssignments.map((a) => a.user.id)
        const selectedSet = new Set(selectedIds)
        const toAdd = selectedIds.filter((id) => !existingIds.includes(id))
        const toRemove = existingAssignments.filter((assignee) => !selectedSet.has(assignee.user.id))

        if (toAdd.length > 0) {
          await createTicketAssignees(ticketId, toAdd)
        }

        if (toRemove.length > 0) {
          await Promise.all(toRemove.map((assignee) => deleteTicketAssignee(assignee.id)))
        }

        await refreshTickets?.()
        toast.success("Task berhasil diupdate", { description: values.title })
        close()
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Gagal mengupdate task."
        setError(msg)
        toast.error("Gagal mengupdate task", { description: msg })
      }
    },
    [close, editingTicket, refreshTickets],
  )

  return {
    assignees: assigneeState.assignees,
    loadingAssignees: assigneeState.loading,
    assigneeError: assigneeState.error,
    refreshAssignees: assigneeState.refresh,
    isOpen,
    isClosing,
    error,
    editingTicket,
    open,
    close,
    handleSubmit,
  }
}
