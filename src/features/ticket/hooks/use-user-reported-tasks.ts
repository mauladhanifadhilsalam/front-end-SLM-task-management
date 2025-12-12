"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ticketKeys } from "@/lib/query-keys"
import {
  deleteTicket,
  fetchAdminTickets,
  type TicketListParams,
} from "@/services/ticket.service"
import type { AdminTicket } from "@/types/ticket-type"

export function useUserReportedTasks(
  currentUserId: number,
  search?: string,
) {
  const queryClient = useQueryClient()

  const filters = React.useMemo<TicketListParams | undefined>(() => {
    if (!currentUserId) return undefined
    const params: TicketListParams = {
      type: "TASK",
      requesterId: currentUserId,
    }

    const trimmed = search?.trim()
    if (trimmed) {
      params.search = trimmed
    }

    return params
  }, [currentUserId, search])

  const queryKey = React.useMemo(() => ticketKeys.list(filters), [filters])

  const ticketsQuery = useQuery({
    queryKey,
    queryFn: () => fetchAdminTickets(filters),
    enabled: Boolean(filters),
    staleTime: 30 * 1000,
  })

  const filteredTickets = React.useMemo(
    () =>
      (ticketsQuery.data ?? []).filter((ticket) => {
        const isTask = String(ticket.type || "").toUpperCase() === "TASK"
        const isRequester = Number(ticket.requesterId) === currentUserId
        return isTask && isRequester
      }),
    [ticketsQuery.data, currentUserId],
  )

  const deleteMutation = useMutation<
    void,
    unknown,
    number,
    { previous?: AdminTicket[] }
  >({
    mutationFn: deleteTicket,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<AdminTicket[]>(queryKey)

      queryClient.setQueryData<AdminTicket[]>(queryKey, (current = []) =>
        current.filter((ticket) => ticket.id !== id),
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

  const errorMessage = React.useMemo(() => {
    if (!ticketsQuery.error) return ""
    if (ticketsQuery.error instanceof Error) {
      return ticketsQuery.error.message
    }
    return "Gagal memuat task yang kamu laporkan."
  }, [ticketsQuery.error])

  const handleDelete = React.useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success("Ticket deleted")
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to delete ticket."
        toast.error("Failed to delete", { description: message })
      }
    },
    [deleteMutation],
  )

  return {
    tickets: filteredTickets,
    loading: ticketsQuery.isLoading,
    error: errorMessage,
    deleteTicket: handleDelete,
    refetch: ticketsQuery.refetch,
  }
}
