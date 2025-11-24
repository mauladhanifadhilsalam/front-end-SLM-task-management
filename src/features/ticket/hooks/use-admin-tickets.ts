"use client"

import * as React from "react"
import { toast } from "sonner"
import type { AdminTicket, AdminTicketColumns } from "@/types/ticket-type"
import { fetchAdminTickets, deleteTicket } from "@/services/ticket.service"

const defaultColumns: AdminTicketColumns = {
  id: true,
  title: true,
  type: true,
  priority: true,
  status: true,
  requester: true,
  project: true,
  startDate: true,
  dueDate: true,
  actions: true,
}

export function useAdminTickets() {
  const [tickets, setTickets] = React.useState<AdminTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [q, setQ] = React.useState("")
  const [cols, setCols] = React.useState<AdminTicketColumns>(defaultColumns)

  const loadTickets = React.useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const data = await fetchAdminTickets()
      setTickets(data)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data tickets"
      setError(msg)
      toast.error("Gagal memuat data tickets", { description: msg })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const formatDate = React.useCallback((iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleString("id-ID")
    } catch {
      return iso ?? "-"
    }
  }, [])

  const filteredTickets = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return tickets
    return tickets.filter((t) => {
      const fields = [
        t.title,
        t.type,
        t.priority,
        t.status,
        t.requesterName,
        t.projectName,
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase())
      return fields.some((f) => f.includes(s))
    })
  }, [tickets, q])

  const toggleColumn = (key: keyof AdminTicketColumns, value: boolean) => {
    setCols((prev) => ({ ...prev, [key]: value }))
  }

  const handleDelete = async (id: number) => {
    const target = tickets.find((x) => x.id === id)
    const prev = tickets
    setTickets((p) => p.filter((x) => x.id !== id))

    try {
      await deleteTicket(id)
      toast.success("Ticket terhapus", {
        description: `Ticket “${target?.title ?? `#${id}`}” berhasil dihapus.`,
      })
    } catch (e: any) {
      setTickets(prev)
      const msg = e?.response?.data?.message || "Gagal menghapus ticket."
      setError(msg)
      toast.error("Gagal menghapus ticket", {
        description: msg,
      })
    }
  }

  return {
    tickets: filteredTickets,
    loading,
    error,
    q,
    cols,
    setSearch: setQ,
    toggleColumn,
    formatDate,
    deleteTicket: handleDelete,
    hasFilter: q.trim().length > 0,
  }
}
