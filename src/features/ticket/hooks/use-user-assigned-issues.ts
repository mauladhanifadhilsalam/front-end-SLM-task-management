"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

import { ticketKeys } from "@/lib/query-keys"
import {
  fetchAdminTickets,
  type TicketListParams,
} from "@/services/ticket.service"

export function useUserAssignedIssues(
  currentUserId: number,
  search?: string,
) {
  const filters = React.useMemo<TicketListParams | undefined>(() => {
    if (!currentUserId) return undefined
    const params: TicketListParams = {
      type: "ISSUE",
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
        const isIssue = String(ticket.type || "").toUpperCase() === "ISSUE"
        const assignees = Array.isArray(ticket.assigneeIds)
          ? ticket.assigneeIds.map((id) => Number(id))
          : []
        return isIssue && assignees.includes(currentUserId)
      }),
    [ticketsQuery.data, currentUserId],
  )

  const errorMessage = React.useMemo(() => {
    if (!ticketsQuery.error) return ""
    if (ticketsQuery.error instanceof Error) {
      return ticketsQuery.error.message
    }
    return "Gagal memuat issue yang ditugaskan."
  }, [ticketsQuery.error])

  return {
    tickets: filteredTickets,
    loading: ticketsQuery.isLoading,
    error: errorMessage,
    refetch: ticketsQuery.refetch,
  }
}
