"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { fetchProjects, type ProjectListParams } from "@/services/project.service"
import type { Project } from "@/types/project.type"
import { projectKeys } from "@/lib/query-keys"

export function usePmProjects(filters?: ProjectListParams) {
  const query = useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => fetchProjects(filters),
    staleTime: 60 * 1000,
  })

  const error = useMemo(() => {
    if (!query.error) return null
    if (query.error instanceof Error) return query.error.message
    return "Gagal memuat data proyek"
  }, [query.error])

  return {
    projects: (query.data ?? []) as Project[],
    loading: query.isLoading,
    error,
    reload: query.refetch,
  }
}
