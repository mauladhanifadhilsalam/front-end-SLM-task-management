"use client"

import * as React from "react"
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
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

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

  React.useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        setError("")
        const data = await fetchNotifications()
        setNotifications(data)
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal memuat data notifikasi"
        setError(msg)
        toast.error("Gagal memuat notifikasi", { description: msg })
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

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

    const prev = notifications
    const target = notifications.find((n) => n.id === deletingId)

    setDeleting(true)
    setNotifications((current) => current.filter((n) => n.id !== deletingId))

    try {
      await deleteNotificationById(deletingId)

      toast.success(`Notifikasi #${deletingId} berhasil dihapus`, {
        description: target?.subject || target?.message?.slice(0, 80),
      })
    } catch (e: any) {
      setNotifications(prev)
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
      const updated = await resendNotificationEmail(notification.id)

      setNotifications((current) =>
        current.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)),
      )

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
    error,
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
