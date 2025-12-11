// src/hooks/useDeveloperDashboard.ts
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { getDeveloperDashboard } from "@/services/developer-dashboard.service"
import type { DeveloperDashboard } from "@/types/developer-dashboard.types"
import { dashboardKeys } from "@/lib/query-keys"

export function useDeveloperDashboard() {
  const query = useQuery({
    queryKey: dashboardKeys.developer(),
    queryFn: getDeveloperDashboard,
    staleTime: 30 * 1000,
  })

  const errorMessage = useMemo(() => {
    if (!query.error) return null
    if (query.error instanceof Error) return query.error.message
    return "Gagal memuat dashboard."
  }, [query.error])

  return {
    dashboard: (query.data ?? null) as DeveloperDashboard | null,
    loading: query.isLoading,
    error: errorMessage,
    refetch: query.refetch,
  }
}
