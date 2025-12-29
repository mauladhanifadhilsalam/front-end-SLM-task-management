"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  fetchTeamUpdatesWithPagination,
  type TeamUpdateListParams,
} from "@/services/team-update.service"
import { teamUpdateKeys } from "@/lib/query-keys"
import type { TeamUpdate } from "@/types/team-update.type"
import type { PaginationMeta } from "@/types/pagination"

export function useTeamUpdates(params?: TeamUpdateListParams) {
  const query = useQuery({
    queryKey: teamUpdateKeys.list(params),
    queryFn: () => fetchTeamUpdatesWithPagination(params),
    staleTime: 60 * 1000,
  })

  const error = useMemo(() => {
    if (!query.error) return null
    if (query.error instanceof Error) return query.error.message
    return "Gagal memuat team updates"
  }, [query.error])

  const data = query.data ?? {
    updates: [] as TeamUpdate[],
    pagination: {
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    } as PaginationMeta,
  }

  return {
    updates: data.updates,
    pagination: data.pagination,
    loading: query.isLoading,
    error,
    reload: query.refetch,
  }
}
