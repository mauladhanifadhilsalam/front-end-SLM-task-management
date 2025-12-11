"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchUnreadNotificationsCount } from "@/services/notification.service"
import { notificationKeys } from "@/lib/query-keys"

export function useUnread() {
  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadNotificationsCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })

  return {
    unread: query.data ?? 0,
    loading: query.isLoading,
    refetch: query.refetch,
  }
}
