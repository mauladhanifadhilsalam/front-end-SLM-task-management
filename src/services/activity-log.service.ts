import { api } from "@/lib/api"
import type {
  ActivityLog,
  ActivityTargetType,
} from "@/types/activity-log.type"
import { extractArrayFromApi } from "@/utils/api-response.util"
import { cleanQueryParams } from "@/utils/query-param.util"
import {
  defaultPaginationMeta,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination"

const mapActivityLog = (item: any): ActivityLog => ({
  id: Number(item.id),
  userId: Number(item.userId ?? item.user_id ?? item.user?.id ?? 0),
  action: String(item.action ?? ""),
  targetType: (item.targetType ??
    item.target_type ??
    "COMMENT") as ActivityTargetType,
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

export type ActivityLogListParams = {
  targetType?: string
  targetId?: number
  userId?: number
  action?: string
  search?: string
  page?: number
  pageSize?: number
  from?: string
  to?: string
}

export type ActivityLogListResult = {
  logs: ActivityLog[]
  pagination: PaginationMeta
}

export const fetchActivityLogsWithPagination = async (
  params?: ActivityLogListParams,
): Promise<ActivityLogListResult> => {
  const { data } = await api.get(`/activity-logs`, {
    params: cleanQueryParams(params),
  })

  const list = extractArrayFromApi(data, ["logs"]).map(mapActivityLog) as ActivityLog[]

  list.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )

  return {
    logs: list,
    pagination: normalizePagination(
      (data as any)?.pagination,
      defaultPaginationMeta,
    ),
  }
}

export const fetchActivityLogs = async (
  params?: ActivityLogListParams,
): Promise<ActivityLog[]> => {
  const { logs } = await fetchActivityLogsWithPagination(params)
  return logs
}

export const deleteActivityLog = async (id: number): Promise<void> => {
  await api.delete(`/activity-logs/${id}`)
}
