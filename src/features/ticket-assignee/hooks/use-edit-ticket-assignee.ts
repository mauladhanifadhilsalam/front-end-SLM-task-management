import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import {
  fetchTicketByIdAssignee,
  updateTicketStatusAndPriority,
} from "@/services/ticket.service"
import { fetchUsers } from "@/services/user.service"
import {
  createTicketAssignees,
  deleteTicketAssignee,
} from "@/services/ticket-assignee.service"
import type { EditTicketAssigneeFormState, EditTicketAssigneeTicket, EditTicketAssigneeUser } from "@/types/ticket-assignee.type"

export function useEditTicketAssignee() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  const [ticket, setTicket] = React.useState<EditTicketAssigneeTicket | null>(
    null,
  )
  const [users, setUsers] = React.useState<EditTicketAssigneeUser[]>([])

  const [form, setForm] = React.useState<EditTicketAssigneeFormState>({
    status: "",
    priority: "",
    assigneeIds: [],
  })

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError("")

        const token = localStorage.getItem("token")
        if (!token) {
          setError("Token tidak ditemukan. Silakan login ulang.")
          return
        }

        const [ticketData, usersData] = await Promise.all([
          fetchTicketByIdAssignee(id),
          fetchUsers(),
        ])

        setTicket(ticketData)
        setUsers(usersData)

        setForm({
          status: ticketData.status,
          priority: ticketData.priority,
          assigneeIds: ticketData.assignees.map((a) => a.user.id),
        })
      } catch (err: any) {
        let msg = "Gagal memuat data tiket."
        const status = err?.response?.status

        if (status === 404) {
          msg = "Tiket tidak ditemukan."
        } else if (status === 401) {
          msg = "Akses ditolak. Silakan login kembali."
        }

        setError(msg)
        toast.error("Gagal memuat data", {
          description: msg,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleStatusChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      status: value,
    }))
  }

  const handlePriorityChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      priority: value,
    }))
  }

  const toggleAssignee = (userId: number) => {
    setForm((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter((id) => id !== userId)
        : [...prev.assigneeIds, userId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id || !ticket) return

    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token tidak ditemukan. Silakan login ulang.")
        setSaving(false)
        return
      }

      const payload = {
        status: form.status,
        priority: form.priority,
      }

      await updateTicketStatusAndPriority(id, payload)

      const currentAssigneeIds = ticket.assignees.map((a) => a.user.id)
      const newAssigneeIds = form.assigneeIds

      const toRemove = ticket.assignees.filter(
        (a) => !newAssigneeIds.includes(a.user.id),
      )

      const toAdd = newAssigneeIds.filter(
        (userId) => !currentAssigneeIds.includes(userId),
      )

      for (const assignee of toRemove) {
        await deleteTicketAssignee(assignee.id)
      }

      if (toAdd.length > 0) {
        await createTicketAssignees(ticket.id, toAdd)
      }

      toast.success("Tiket berhasil diperbarui", {
        description: `Tiket "${ticket.title}" berhasil diperbarui.`,
      })

      navigate("/admin/dashboard/ticket-assignees")
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Gagal menyimpan perubahan."
      setError(message)
      toast.error("Gagal menyimpan perubahan", {
        description: message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    navigate("/admin/dashboard/ticket-assignees")
  }

  return {
    id,
    loading,
    saving,
    error,
    ticket,
    users,
    form,
    handleStatusChange,
    handlePriorityChange,
    toggleAssignee,
    handleSubmit,
    handleBack,
  }
}
