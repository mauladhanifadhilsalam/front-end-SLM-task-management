// src/services/developer.service.ts
import { api } from "@/lib/api"
import type { DeveloperDashboard } from "@/types/developer-dashboard.types"

export async function getDeveloperDashboard(): Promise<DeveloperDashboard> {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.")
  }

  // Use shared `api` instance which automatically adds Authorization header via interceptor
  const res = await api.get("/dashboard/developer")

    // Backend returns an array with 1 element, so extract the first element
  const data = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : res.data
  
  console.debug("getDeveloperDashboard: extracted dashboard data from array:", data)

  return data as DeveloperDashboard
}
