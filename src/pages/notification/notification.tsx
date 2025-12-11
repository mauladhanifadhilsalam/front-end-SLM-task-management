"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { AppSidebarDev } from "@/pages/dashboard/dev/components/app-sidebardev"
import { AppSidebarPm } from "../dashboard/pm/components/sidebar-pm"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  NotificationList,
  type Notification as UiNotification,
} from "./components/notification-list"
import {
  fetchNotifications,
  updateNotificationState,
} from "@/services/notification.service"
import { fetchTicketById } from "@/services/ticket.service"
import { notificationKeys } from "@/lib/query-keys"

type NotificationWithMeta = UiNotification & {
  ticketProjectId: number | null
  ticketType?: string | null
}

const mapNotification = (raw: any): NotificationWithMeta => ({
  id: Number(raw.id),
  recipientId: Number(raw.recipientId ?? raw.recipient_id ?? 0),
  targetType: raw.targetType ?? raw.target_type ?? "TICKET",
  targetId:
    raw.targetId != null
      ? Number(raw.targetId)
      : raw.target_id != null
        ? Number(raw.target_id)
        : null,
  ticketProjectId:
    raw.ticketProjectId ??
    raw.projectId ??
    raw.project_id ??
    raw.ticket?.projectId ??
    raw.ticket?.project_id ??
    raw.ticket?.project?.id ??
    null,
  ticketType: raw.ticketType ?? raw.type ?? raw.ticket?.type ?? null,
  message: raw.message ?? "",
  state: raw.state ?? "UNREAD",
  createdAt: raw.createdAt ?? new Date().toISOString(),
  readAt: raw.readAt ?? null,
  status: raw.status ?? null,
  emailError: raw.emailError ?? null,
  recipient: raw.recipient
    ? {
        id: Number(raw.recipient.id),
        fullName: raw.recipient.fullName ?? raw.recipient.name ?? "",
        email: raw.recipient.email ?? "",
        role: raw.recipient.role,
      }
    : undefined,
})

export default function NotificationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const data = await fetchNotifications()
      return data.map(mapNotification)
    },
  })

  const notifications = notificationsQuery.data ?? []

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => updateNotificationState(id, "READ"),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() })
      const previous =
        queryClient.getQueryData<NotificationWithMeta[]>(
          notificationKeys.list(),
        ) ?? []
      const nowIso = new Date().toISOString()

      queryClient.setQueryData<NotificationWithMeta[]>(
        notificationKeys.list(),
        (old = []) =>
          old.map((n) =>
            n.id === id ? { ...n, state: "READ", readAt: nowIso } : n,
          ),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.list(),
          context.previous,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => updateNotificationState(id, "READ")))
    },
    onMutate: async (ids) => {
      if (ids.length === 0) return { previous: undefined }
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() })
      const previous =
        queryClient.getQueryData<NotificationWithMeta[]>(
          notificationKeys.list(),
        ) ?? []
      const nowIso = new Date().toISOString()
      const idSet = new Set(ids)

      queryClient.setQueryData<NotificationWithMeta[]>(
        notificationKeys.list(),
        (old = []) =>
          old.map((n) =>
            idSet.has(n.id) ? { ...n, state: "READ", readAt: nowIso } : n,
          ),
      )

      return { previous }
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.list(),
          context.previous,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
    },
  })

  const role = React.useMemo(() => {
    return localStorage.getItem("role")
  }, [])

  const basePath =
    role === "project_manager"
      ? "/project-manager/dashboard"
      : role === "developer"
        ? "/developer/dashboard"
        : "/admin/dashboard"

  const resolveTicketInfo = React.useCallback(
    async (n: NotificationWithMeta) => {
      let ticketType = n.ticketType?.toString().toUpperCase() ?? null
      let projectId =
        n.ticketProjectId != null ? Number(n.ticketProjectId) : null

      if (ticketType && projectId) {
        return { ticketType, projectId }
      }

      if (!n.targetId) {
        return { ticketType, projectId }
      }

      try {
        const ticket = await fetchTicketById(n.targetId)
        ticketType =
          ticketType ??
          ticket.type ??
          null

        const resolvedProjectId = Number(
          projectId ?? ticket.projectId ?? 0,
        )

        projectId =
          Number.isFinite(resolvedProjectId) && resolvedProjectId > 0
            ? resolvedProjectId
            : null
      } catch (err) {
        console.error("Failed to resolve ticket info", err)
      }

      return {
        ticketType: ticketType ? ticketType.toString().toUpperCase() : null,
        projectId,
      }
    },
    [],
  )

  const handleOpen = React.useCallback(
    async (n: UiNotification) => {
      const notification = n as NotificationWithMeta

      if (notification.targetType === "TICKET" && notification.targetId) {
        const { ticketType, projectId } = await resolveTicketInfo(
          notification,
        )
        const upperType = ticketType?.toString().toUpperCase() ?? ""

        if (role === "project_manager") {
          if (upperType === "TASK" && projectId) {
            navigate(
              `/project-manager/dashboard/projects/${projectId}/tasks/${notification.targetId}`,
            )
            return
          }

          navigate(
            `/project-manager/dashboard/ticket-issue/view/${notification.targetId}`,
          )
          return
        }

        if (role === "developer") {
          if (upperType === "TASK" && projectId) {
            navigate(
              `/developer-dashboard/projects/${projectId}/tasks/${notification.targetId}`,
            )
            return
          }

          if (projectId) {
            navigate(
              `/developer-dashboard/projects/${projectId}/issues/${notification.targetId}`,
            )
            return
          }

          navigate("/developer-dashboard/projects")
          return
        }

        navigate(`/admin/dashboard/tickets/view/${notification.targetId}`)
        return
      }
      if (notification.targetType === "PROJECT" && notification.targetId) {
        navigate(`${basePath}/projects/view/${notification.targetId}`)
        return
      }
    },
    [resolveTicketInfo, role, navigate, basePath],
  )

  const handleMarkAsRead = React.useCallback(
    (n: UiNotification) => {
      if (n.state === "READ") return
      markAsReadMutation.mutate(n.id)
    },
    [markAsReadMutation],
  )

  const handleMarkAllAsRead = React.useCallback(() => {
    const unreadIds = notifications
      .filter((n) => n.state === "UNREAD")
      .map((n) => n.id)
    if (unreadIds.length === 0) return
    markAllMutation.mutate(unreadIds)
  }, [markAllMutation, notifications])

  const loading =
    notificationsQuery.isLoading ||
    notificationsQuery.isFetching ||
    markAllMutation.isPending
  const error = notificationsQuery.error
    ? notificationsQuery.error instanceof Error
      ? notificationsQuery.error.message
      : "Gagal memuat notifikasi"
    : null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {role === "project_manager" ? (
        <AppSidebarPm variant="inset" />
      ) : (
        <AppSidebarDev variant="inset" />
      )}
      <SidebarInset>
        <SiteHeader />

        <main className="flex flex-1 flex-col px-4 py-4 lg:px-6 lg:py-6">
          <div className="">
            <NotificationList
              notifications={notifications}
              loading={loading}
              error={error}
              onReload={() => notificationsQuery.refetch()}
              onOpen={handleOpen}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
