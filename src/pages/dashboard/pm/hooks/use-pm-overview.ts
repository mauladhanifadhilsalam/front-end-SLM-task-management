"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { getPmOverview } from "@/services/pm-overview.service"
import type { PmOverview } from "@/types/pm-overview.type"
import { dashboardKeys } from "@/lib/query-keys"

export function usePmOverview() {
  const query = useQuery({
    queryKey: dashboardKeys.pmOverview(),
    queryFn: getPmOverview,
    staleTime: 30 * 1000,
  })

  const error = useMemo(() => {
    if (!query.error) return null
    if (query.error instanceof Error) {
      return query.error.message
    }
    return "Failed to load PM overview"
  }, [query.error])

  return {
    data: (query.data ?? null) as PmOverview | null,
    loading: query.isLoading,
    error,
    refetch: query.refetch,
  }
}
