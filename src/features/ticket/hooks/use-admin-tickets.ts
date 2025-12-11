"use client"

import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { ticketKeys } from "@/lib/query-keys"
import {
  deleteTicket,
  fetchAdminTicketsWithPagination,
  type TicketListParams,
  type AdminTicketListResult,
} from "@/services/ticket.service"
import type { AdminTicket, AdminTicketColumns } from "@/types/ticket-type"

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

const normalizeSearch = (value: string) => value.trim().toLowerCase()

export function useAdminTickets() {
  const queryClient = useQueryClient()
  const [error, setError] = React.useState("")
  const [q, setQ] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [cols, setCols] = React.useState<AdminTicketColumns>(defaultColumns)

  const filters = React.useMemo<TicketListParams>(() => {
    const search = normalizeSearch(q)
    return {
      page,
      pageSize,
      ...(search ? { search } : {}),
    }
  }, [q, page, pageSize])

  const queryKey = React.useMemo(() => ticketKeys.list(filters), [filters])

  const ticketsQuery = useQuery<AdminTicketListResult>({
    queryKey,
    queryFn: () => fetchAdminTicketsWithPagination(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
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

  const tickets = ticketsQuery.data?.tickets ?? []
  const pagination = ticketsQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const formatDate = React.useCallback((iso?: string) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleString("id-ID")
    } catch {
      return iso ?? "-"
    }
  }, [])

  const toggleColumn = (key: keyof AdminTicketColumns, value: boolean) => {
    setCols((prev) => ({ ...prev, [key]: value }))
  }

  const deleteMutation = useMutation({
    mutationFn: deleteTicket,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<AdminTicketListResult>(queryKey)

      queryClient.setQueryData<AdminTicketListResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            tickets: current.tickets.filter((t) => t.id !== id),
            pagination: {
              ...current.pagination,
              total: Math.max(0, current.pagination.total - 1),
            },
          }
        },
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleDelete = async (id: number) => {
    const target = tickets.find((x) => x.id === id)
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Ticket terhapus", {
        description: `Ticket "${target?.title ?? `#${id}`}" berhasil dihapus.`,
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
    tickets,
    loading: ticketsQuery.isLoading,
    error,
    q,
    cols,
    setSearch: setQ,
    toggleColumn,
    formatDate,
    deleteTicket: handleDelete,
    hasFilter: q.trim().length > 0,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
    refetch: ticketsQuery.refetch,
  }
}
