"use client"

import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import type { TicketAssigneeTicketDetail } from "@/types/ticket-assignee.type"
import { fetchTicketById, deleteTicket } from "@/services/ticket.service"

export function useViewTicketAssignee() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ticket, setTicket] = React.useState<TicketAssigneeTicketDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)

  const loadTicket = React.useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Sesi otentikasi tidak ditemukan. Harap login.")
        setLoading(false)
        return
      }

      const data = await fetchTicketById(id)
      setTicket(data)
    } catch (e: any) {
      let msg = "Gagal memuat data tiket."
      const status = e?.response?.status

      if (status === 404) {
        msg = "Tiket tidak ditemukan."
      } else if (status === 401) {
        msg = "Akses ditolak. Silakan login kembali."
      }

      setError(msg)
      toast.error("Gagal memuat data tiket", {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    loadTicket()
  }, [loadTicket])

  const handleBack = () => {
    navigate("/admin/dashboard/ticket-assignees")
  }

  const handleEdit = () => {
    if (!ticket) return
    navigate(`/admin/dashboard/ticket-assignee/edit/${ticket.id}`)
  }

  const handleConfirmDelete = async () => {
    if (!ticket) return

    setDeleting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Sesi otentikasi tidak ditemukan. Harap login.")
        setDeleting(false)
        return
      }

      await deleteTicket(ticket.id)

      toast.success("Tiket dihapus", {
        description: `Tiket "${ticket.title}" berhasil dihapus.`,
      })

      navigate("/admin/dashboard/ticket-assignees")
    } catch (e: any) {
      const message = e?.response?.data?.message || "Gagal menghapus tiket."
      setError(message)
      toast.error("Gagal menghapus tiket", {
        description: message,
      })
    } finally {
      setDeleting(false)
    }
  }

  return {
    ticket,
    loading,
    error,
    deleting,
    handleBack,
    handleEdit,
    handleConfirmDelete,
  }
}
