"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AdminTicket, AdminTicketColumns } from "@/types/ticket-type"
import { fetchAdminTickets, deleteTicket } from "@/services/ticket.service"
import { ticketKeys } from "@/lib/query-keys"

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
  const queryClient = useQueryClient()
  const [error, setError] = React.useState("")
  const [q, setQ] = React.useState("")
  const [cols, setCols] = React.useState<AdminTicketColumns>(defaultColumns)

  const ticketsQuery = useQuery({
    queryKey: ticketKeys.list(),
    queryFn: fetchAdminTickets,
    staleTime: 30 * 1000,
  })

  React.useEffect(() => {
    if (ticketsQuery.error) {
      const msg =
        ticketsQuery.error instanceof Error
          ? ticketsQuery.error.message
          : "Gagal memuat data tickets"
      setError(msg)
      toast.error("Gagal memuat data tickets", { description: msg })
    } else if (ticketsQuery.isSuccess) {
      setError("")
    }
  }, [ticketsQuery.error, ticketsQuery.isSuccess])

  const tickets = ticketsQuery.data ?? []

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

  const deleteMutation = useMutation({
    mutationFn: deleteTicket,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.list() })
      const previous =
        queryClient.getQueryData<AdminTicket[]>(ticketKeys.list()) ?? []

      queryClient.setQueryData<AdminTicket[]>(
        ticketKeys.list(),
        (current = []) => current.filter((t) => t.id !== id),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ticketKeys.list(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.list() })
    },
  })

  const handleDelete = async (id: number) => {
    const target = tickets.find((x) => x.id === id)
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Ticket terhapus", {
        description: `Ticket “${target?.title ?? `#${id}`}” berhasil dihapus.`,
      })
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal menghapus ticket."
      setError(msg)
      toast.error("Gagal menghapus ticket", {
        description: msg,
      })
    }
  }

  return {
    tickets: filteredTickets,
    loading: ticketsQuery.isLoading,
    error,
    q,
    cols,
    setSearch: setQ,
    toggleColumn,
    formatDate,
    deleteTicket: handleDelete,
    hasFilter: q.trim().length > 0,
    refetch: ticketsQuery.refetch,
  }
}
