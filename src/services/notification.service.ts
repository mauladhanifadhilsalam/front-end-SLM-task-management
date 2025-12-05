import axios from "axios"
import type { Notification } from "@/types/notification.type"
import {
  extractArrayFromApi,
  unwrapApiData,
} from "@/utils/api-response.util"

const API_BASE = import.meta.env.VITE_API_BASE

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) return undefined
  return { Authorization: `Bearer ${token}` }
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  const res = await axios.get<Notification[]>(`${API_BASE}/notifications`, {
    headers: getAuthHeaders(),
  })

  const data = extractArrayFromApi<Notification>(res.data, [
    "notifications",
  ])

  return data
}

export const deleteNotificationById = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE}/notifications/${id}`, {
    headers: getAuthHeaders(),
  })
}

export const resendNotificationEmail = async (
  id: number,
): Promise<Notification> => {
  const res = await axios.post<Notification>(
    `${API_BASE}/notifications/${id}/resend`,
    {},
    {
      headers: getAuthHeaders(),
    },
  )

  return unwrapApiData<Notification>(res.data)
}

export const fetchNotificationById = async (id: number): Promise<Notification> => {
  const res = await axios.get<Notification>(`${API_BASE}/notifications/${id}`, {
    headers: getAuthHeaders(),
  })

  return unwrapApiData<Notification>(res.data)
}
