"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { getPmDeveloperHighlights } from "@/services/pm-overview.service"
import type { PmDeveloperHighlight } from "@/types/pm-overview.type"
import { dashboardKeys } from "@/lib/query-keys"

export function useDeveloperHighlights() {
  const query = useQuery({
    queryKey: dashboardKeys.pmDeveloperHighlights(),
    queryFn: getPmDeveloperHighlights,
    staleTime: 30 * 1000,
  })

  const error = useMemo(() => {
    if (!query.error) return null
    if (query.error instanceof Error) return query.error.message
    return "Failed to load developer stats"
  }, [query.error])

  return {
    data: (query.data ?? []) as PmDeveloperHighlight[],
    loading: query.isLoading,
    error,
    refetch: query.refetch,
  }
}
