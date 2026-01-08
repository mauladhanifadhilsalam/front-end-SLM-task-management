"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { getPmDailyCadence } from "@/services/pm-daily-cadence.service"
import type { PmDailyCadence } from "@/types/pm-daily-cadence.type"
import { dashboardKeys } from "@/lib/query-keys"

export function usePmDailyCadence(projectId?: number | string) {
  const enabled = Boolean(projectId)

  const query = useQuery({
    queryKey: dashboardKeys.pmDailyCadence(projectId),
    queryFn: () => getPmDailyCadence(projectId as number | string),
    staleTime: 30 * 1000,
    enabled,
  })

  const error = useMemo(() => {
    if (!query.error) return null
    if (query.error instanceof Error) {
      return query.error.message
    }
    return "Failed to load daily cadence"
  }, [query.error])

  return {
    data: (query.data ?? null) as PmDailyCadence | null,
    loading: query.isLoading,
    error,
    refetch: query.refetch,
  }
}
