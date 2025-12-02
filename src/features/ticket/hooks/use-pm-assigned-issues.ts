"use client"

import * as React from "react"
import { fetchAdminTickets, deleteTicket } from "@/services/ticket.service"
import { toast } from "sonner"
import type { AdminTicket } from "@/types/ticket-type"

export function usePmAssignedIssues(currentUserId: number) {
  const [tickets, setTickets] = React.useState<AdminTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [q, setSearch] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const all = await fetchAdminTickets()

      // 🔥 filter by assigneeIds
      const assigned = all.filter((t) => {
        if (!Array.isArray(t.assigneeIds)) return false

        // pastikan convert ke number semua
        const ids = t.assigneeIds.map((x: any) => Number(x))
        return ids.includes(currentUserId)
      })

      setTickets(assigned)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  React.useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: number) => {
    try {
      await deleteTicket(id)
      setTickets((prev) => prev.filter((t) => t.id !== id))
      toast.success("Tiket berhasil dihapus")
    } catch {
      toast.error("Gagal menghapus tiket")
    }
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "-"
    const d = new Date(iso)
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return {
    tickets,
    loading,
    error,
    q,
    setSearch,
    hasFilter: false,
    handleDelete,
    formatDate,
  }
}
