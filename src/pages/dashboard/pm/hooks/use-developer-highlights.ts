"use client"

import * as React from "react"
import { getPmDeveloperHighlights } from "@/services/pm-overview.service"
import type { PmDeveloperHighlight } from "@/types/pm-overview.type"

export function useDeveloperHighlights() {
  const [data, setData] = React.useState<PmDeveloperHighlight[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await getPmDeveloperHighlights()
        setData(res || [])
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load developer stats")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { data, loading, error }
}
