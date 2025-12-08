// src/hooks/useDeveloperDashboard.ts
import * as React from "react"
import { getDeveloperDashboard } from "@/services/developer-dashboard.service"
import type { DeveloperDashboard } from "@/types/developer-dashboard.types"

export function useDeveloperDashboard() {
  const [dashboard, setDashboard] = React.useState<DeveloperDashboard | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem("token"))

  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        console.debug("useDeveloperDashboard: token changed, refetching dashboard")
        setToken(e.newValue)
      }
    }

    window.addEventListener("storage", handleStorage)

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getDeveloperDashboard()
        setDashboard(data)
      } catch (err: any) {
        console.error("❌ Error fetching dashboard:", err)

        if (err.response) {
          console.error("Response status:", err.response.status)
          console.error("Response data:", err.response.data)
          setError(
            `Error ${err.response.status}: ${
              err.response.data?.message || "Gagal memalu data"
            }`
          )
        } else if (err.message?.includes("Token")) {
          setError("Sesi Anda telah berakhir. Silakan login kembali.")
        } else {
          setError("Gagal terhubung ke server. Periksa koneksi Anda.")
        }
      } finally {
        setLoading(false)
      }
    }

    // Always fetch on mount or when token changes
    setToken(localStorage.getItem("token"))
    fetchDashboard()

    return () => window.removeEventListener("storage", handleStorage)
  }, [token])

  return { dashboard, loading, error }
}
