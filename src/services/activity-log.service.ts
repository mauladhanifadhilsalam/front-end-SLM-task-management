import axios from "axios"
import type { ActivityLog } from "@/types/activity-log.type"

const API_BASE = import.meta.env.VITE_API_BASE as string

const getAuthHeader = () => {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

const normalizeArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.logs)) return raw.logs
  if (Array.isArray(raw?.data?.logs)) return raw.data.logs
  if (raw && typeof raw === "object") return [raw]
  return []
}

const mapActivityLog = (item: any): ActivityLog => ({
  id: Number(item.id),
  userId: Number(item.userId ?? item.user_id ?? item.user?.id ?? 0),
  action: String(item.action ?? ""),
  targetType: String(item.targetType ?? item.target_type ?? "-"),
  targetId: Number(item.targetId ?? item.target_id ?? 0),
  details: (item.details as Record<string, unknown>) ?? {},
  occurredAt: String(
    item.occurredAt ??
      item.occurred_at ??
      item.createdAt ??
      item.created_at ??
      new Date().toISOString(),
  ),
  user: {
    id: Number(item.user?.id ?? item.userId ?? item.user_id ?? 0),
    fullName: item.user?.fullName ?? item.user?.name ?? "Unknown User",
    email: item.user?.email ?? "-",
    role: item.user?.role ?? "-",
  },
})

export const fetchActivityLogs = async (): Promise<ActivityLog[]> => {
  const res = await axios.get(`${API_BASE}/activity-logs`, {
    headers: getAuthHeader(),
  })

  const list = normalizeArray(res?.data).map(mapActivityLog) as ActivityLog[]

  list.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() -
      new Date(a.occurredAt).getTime(),
  )

  return list
}

export const deleteActivityLog = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/activity-logs/${id}`, {
    headers: getAuthHeader(),
  })
}
