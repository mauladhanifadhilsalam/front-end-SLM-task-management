// src/services/developer.service.ts
import { api } from "@/lib/api"
import type { DeveloperDashboard } from "@/types/developer-dashboard.types"

export async function getDeveloperDashboard(): Promise<DeveloperDashboard> {
  const res = await api.get("/dashboard/developer")
  const payload = (res.data as any)?.data ?? res.data
  return (Array.isArray(payload) ? payload[0] : payload) as DeveloperDashboard
}
