"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  fetchProjectUpdatesWithPagination,
  type ProjectUpdateListParams,
} from "@/services/project-update.service"
import { projectUpdateKeys } from "@/lib/query-keys"
import type { ProjectUpdate } from "@/types/project-update.type"
import type { PaginationMeta } from "@/types/pagination"

export function useProjectUpdates(params?: ProjectUpdateListParams) {
  const query = useQuery({
    queryKey: projectUpdateKeys.list(params),
    queryFn: () => fetchProjectUpdatesWithPagination(params),
    staleTime: 60 * 1000,
  })

  const error = useMemo(() => {
    if (!query.error) return null
    if (query.error instanceof Error) return query.error.message
    return "Gagal memuat project updates"
  }, [query.error])

  const data = query.data ?? {
    updates: [] as ProjectUpdate[],
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
