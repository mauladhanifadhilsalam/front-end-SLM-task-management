"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { ticketKeys } from "@/lib/query-keys"
import {
  fetchAdminTickets,
  type TicketListParams,
} from "@/services/ticket.service"

export function useUserAssignedTasks(
  currentUserId: number,
  search?: string,
) {
  const filters = React.useMemo<TicketListParams | undefined>(() => {
    if (!currentUserId) return undefined
    const params: TicketListParams = {
      type: "TASK",
      assigneeId: currentUserId,
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
        const assignees = Array.isArray(ticket.assigneeIds)
          ? ticket.assigneeIds.map((id) => Number(id))
          : []
        return isTask && assignees.includes(currentUserId)
      }),
    [ticketsQuery.data, currentUserId],
  )

  const errorMessage = React.useMemo(() => {
    if (!ticketsQuery.error) return ""
    if (ticketsQuery.error instanceof Error) {
      return ticketsQuery.error.message
    }
    return "Gagal memuat task yang ditugaskan."
  }, [ticketsQuery.error])

  return {
    tickets: filteredTickets,
    loading: ticketsQuery.isLoading,
    error: errorMessage,
    refetch: ticketsQuery.refetch,
  }
}
