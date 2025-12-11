import type { Notification } from "@/types/notification.type"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"
import { api } from "@/lib/api"
import { cleanQueryParams } from "@/utils/query-param.util"
import {
  defaultPaginationMeta,
  normalizePagination,
  type PaginationMeta,
} from "@/types/pagination"

export type NotificationListParams = {
  recipientId?: number
  targetType?: string
  targetId?: number
  state?: "UNREAD" | "READ" | "DISMISSED"
  status?: "PENDING" | "SENT" | "FAILED"
  search?: string
  page?: number
  pageSize?: number
  sentFrom?: string
  sentTo?: string
}

export type NotificationListResult = {
  notifications: Notification[]
  pagination: PaginationMeta
}

export const fetchNotificationsWithPagination = async (
  params?: NotificationListParams,
): Promise<NotificationListResult> => {
  const { data } = await api.get("/notifications", {
    params: cleanQueryParams(params),
  })

  return {
    notifications: extractArrayFromApi<Notification>(data, [
      "notifications",
    ]),
    pagination: normalizePagination(
      (data as any)?.pagination,
      defaultPaginationMeta,
    ),
  }
}

export const fetchNotifications = async (
  params?: NotificationListParams,
): Promise<Notification[]> => {
  const { notifications } = await fetchNotificationsWithPagination(params)
  return notifications
}

export const deleteNotificationById = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`)
}

export const resendNotificationEmail = async (
  id: number,
): Promise<Notification> => {
  const { data } = await api.post<Notification>(
    `/notifications/${id}/resend`,
    {},
  )

  return unwrapApiData<Notification>(data)
}

export const fetchNotificationById = async (id: number): Promise<Notification> => {
  const { data } = await api.get<Notification>(`/notifications/${id}`)

  return unwrapApiData<Notification>(data)
}

export const updateNotificationState = async (
  id: number,
  state: "READ" | "UNREAD",
) => {
  await api.patch(`/notifications/${id}/state`, { state })
}

const UNREAD_ENDPOINTS: Record<string, string> = {
  project_manager: "/dashboard/project-manager",
  developer: "/dashboard/developer",
}

export const fetchUnreadNotificationsCount = async (): Promise<number> => {
  const role = localStorage.getItem("role") ?? ""
  const endpoint = UNREAD_ENDPOINTS[role]
  if (!endpoint) return 0

  const { data } = await api.get(endpoint)
  const payload = (data as any)?.data ?? data ?? {}
  return (
    payload?.unreadNotificationsCount ??
    payload?.unread_notifications_count ??
    payload?.stats?.unreadNotifications ??
    0
  )
}
