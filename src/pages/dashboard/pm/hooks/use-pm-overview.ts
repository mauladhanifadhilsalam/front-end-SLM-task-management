"use client"

import * as React from "react"
import { getPmOverview } from "@/services/pm-overview.service"
import type { PmOverview } from "@/types/pm-overview.type"

export function usePmOverview() {
  const [data, setData] = React.useState<PmOverview | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await getPmOverview()
        setData(res)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load PM overview")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { data, loading, error }
}
