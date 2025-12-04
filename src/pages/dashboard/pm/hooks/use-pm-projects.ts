"use client"

import * as React from "react"
import { fetchProjects } from "@/services/project.service"
import type { Project } from "@/types/project.type"

export function usePmProjects() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProjects()
      setProjects(data)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data proyek"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return { projects, loading, error, reload: load }
}
