"use client"

import * as React from "react"
import { fetchAdminTickets, deleteTicket } from "@/services/ticket.service"
import type { AdminTicket } from "@/types/ticket-type"
import { toast } from "sonner"

export function usePmReportedIssues(currentUserId: number) {
  const [tickets, setTickets] = React.useState<AdminTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [q, setSearch] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const all = await fetchAdminTickets()
      const mine = all.filter((t) => t.requesterId === currentUserId)

      setTickets(mine)
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
      setTickets(tickets.filter((t) => t.id !== id))
      toast.success("Ticket deleted")
    } catch {
      toast.error("Failed to delete")
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
    handleDelete,
    formatDate,
    hasFilter: false,
  }
}
