"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchNotifications,
  deleteNotificationById,
  resendNotificationEmail,
} from "@/services/notification.service"
import type {
  Notification,
  NotificationState,
  NotifyStatusType,
  NotificationTargetType,
} from "@/types/notification.type"
import { notificationKeys } from "@/lib/query-keys"

type ColState = {
  id: boolean
  subject: boolean
  message: boolean
  target: boolean
  recipient: boolean
  state: boolean
  emailInfo: boolean
  emailStatus: boolean
  createdAt: boolean
  readAt: boolean
  actions: boolean
}

export const useAdminNotifications = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState("")
  const [stateFilter, setStateFilter] = React.useState<string>("all")

  const [cols, setCols] = React.useState<ColState>({
    id: true,
    subject: true,
    message: true,
    target: true,
    recipient: true,
    state: true,
    emailInfo: true,
    emailStatus: true,
    createdAt: true,
    readAt: true,
    actions: true,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const notificationsQuery = useQuery({
    queryKey: notificationKeys.adminList(),
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
  })

  const notifications = notificationsQuery.data ?? []
  const loading = notificationsQuery.isLoading
  const errorMessage = notificationsQuery.error
    ? notificationsQuery.error instanceof Error
      ? notificationsQuery.error.message
      : "Gagal memuat data notifikasi"
    : ""

  React.useEffect(() => {
    if (errorMessage) {
      toast.error("Gagal memuat notifikasi", { description: errorMessage })
    }
  }, [errorMessage])

  const filteredNotifications = React.useMemo(() => {
    const ql = search.trim().toLowerCase()

    const filtered = notifications.filter((n) => {
      if (stateFilter !== "all" && n.state !== stateFilter) return false
      if (!ql) return true

      return (
        n.message.toLowerCase().includes(ql) ||
        (n.subject ?? "").toLowerCase().includes(ql) ||
        n.targetType.toLowerCase().includes(ql) ||
        String(n.targetId).includes(ql) ||
        n.recipient?.fullName?.toLowerCase().includes(ql) ||
        n.recipient?.email?.toLowerCase().includes(ql) ||
        (n.emailFrom ?? "").toLowerCase().includes(ql) ||
        (n.emailReplyTo ?? "").toLowerCase().includes(ql)
      )
    })

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [notifications, search, stateFilter])

  const deleteMutation = useMutation({
    mutationFn: deleteNotificationById,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.adminList() })
      const previous =
        queryClient.getQueryData<Notification[]>(
          notificationKeys.adminList(),
        ) ?? []

      queryClient.setQueryData<Notification[]>(
        notificationKeys.adminList(),
        (current = []) => current.filter((n) => n.id !== id),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.adminList(),
          context.previous,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.adminList(),
      })
    },
  })

  const resendMutation = useMutation({
    mutationFn: resendNotificationEmail,
    onSuccess: (updated) => {
      queryClient.setQueryData<Notification[]>(
        notificationKeys.adminList(),
        (current = []) =>
          current.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)),
      )
    },
  })

  const formatDate = (value: string | null) => {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleString("id-ID")
  }

  const stateBadgeVariant = (
    state: NotificationState,
  ): "default" | "outline" | "secondary" => {
    if (state === "UNREAD") return "default"
    if (state === "READ") return "outline"
    return "secondary"
  }

  const stateLabel = (state: NotificationState) => {
    if (state === "UNREAD") return "UNREAD"
    if (state === "READ") return "READ"
    return state
  }

  const notifyStatusVariant = (
    status: NotifyStatusType,
  ): "default" | "outline" | "secondary" | "destructive" => {
    if (status === "PENDING") return "secondary"
    if (status === "SENT") return "default"
    if (status === "FAILED") return "destructive"
    return "outline"
  }

  const notifyStatusLabel = (status: NotifyStatusType) => {
    if (!status) return "-"
    return status
  }

  const targetLabel = (type: NotificationTargetType, id: number) =>
    `${type} #${id}`

  const toggleColumn = (key: keyof ColState, value: boolean | "indeterminate") =>
    setCols((c) => ({ ...c, [key]: !!value }))

  const openDeleteDialog = (id: number) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    if (deleting) return
    setDeleteDialogOpen(false)
    setDeletingId(null)
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    const target = notifications.find((n) => n.id === deletingId)

    setDeleting(true)
    try {
      await deleteMutation.mutateAsync(deletingId)

      toast.success(`Notifikasi #${deletingId} berhasil dihapus`, {
        description: target?.subject || target?.message?.slice(0, 80),
      })
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal menghapus notifikasi"
      toast.error("Gagal menghapus notifikasi", { description: msg })
    } finally {
      setDeleting(false)
      setDeletingId(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleResend = async (notification: Notification) => {
    try {
      const updated = await resendMutation.mutateAsync(notification.id)
      toast.success("Email notifikasi berhasil dikirim ulang", {
        description: updated.subject || updated.message?.slice(0, 80),
      })
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Gagal mengirim ulang email notifikasi"
      toast.error("Gagal mengirim ulang notifikasi", { description: msg })
    }
  }

  return {
    notifications,
    loading,
    error: errorMessage,
    search,
    setSearch,
    stateFilter,
    setStateFilter,
    cols,
    toggleColumn,
    filteredNotifications,
    formatDate,
    stateBadgeVariant,
    stateLabel,
    notifyStatusVariant,
    notifyStatusLabel,
    targetLabel,
    deleteDialogOpen,
    deleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    handleResend,
  }
}
