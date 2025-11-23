import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { TicketDetail } from "@/types/ticket-type"
import { fetchTicketById, deleteTicket } from "@/services/ticket.service"

export function useTicketDetail(id: string | undefined) {
  const navigate = useNavigate()

  const [ticket, setTicket] = React.useState<TicketDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const formatDate = React.useCallback((iso?: string | null) => {
    if (!iso) return "-"
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID")
  }, [])

  const load = React.useCallback(async () => {
    if (!id) {
      setError("ID ticket tidak valid.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchTicketById(id)
      setTicket(data)
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal memuat ticket"

      setError(msg)
      toast.error("Gagal memuat ticket", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  const handleDelete = React.useCallback(async () => {
    if (!ticket) return
    setDeleting(true)

    try {
      await deleteTicket(ticket.id)
      toast.success("Ticket dihapus", {
        description: `Ticket "${ticket.title}" berhasil dihapus.`,
      })
      navigate("/admin/dashboard/tickets")
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal menghapus ticket."
      toast.error("Gagal menghapus ticket", { description: msg })
      setDeleting(false)
    }
  }, [ticket, navigate])

  return {
    ticket,
    loading,
    error,
    deleting,
    formatDate,
    deleteCurrent: handleDelete,
  }
}
