"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { Notification } from "@/types/notification.type"
import {
  fetchNotificationById,
  deleteNotificationById,
} from "@/services/notification.service"

export const useAdminNotificationDetail = (rawId: string | undefined) => {
  const navigate = useNavigate()

  const [notification, setNotification] = React.useState<Notification | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const id = React.useMemo(() => {
    const n = Number(rawId)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [rawId])

  const formatDateTime = React.useCallback((value: string | null) => {
    if (!value) return "-"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleString("id-ID")
  }, [])

  React.useEffect(() => {
    if (!id) {
      setError("Invalid notification ID")
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchNotificationById(id)
        setNotification(data)
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Failed to load notification"
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const openDeleteDialog = () => {
    if (!notification) return
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    if (deleting) return
    setDeleteDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!notification) return
    try {
      setDeleting(true)
      await deleteNotificationById(notification.id)
      toast.success("Notification deleted successfully")
      setDeleteDialogOpen(false)
      navigate("/admin-dashboard/notifications")
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to delete notification"
      toast.error(msg)
      setDeleting(false)
    }
  }

  return {
    id,
    notification,
    loading,
    error,
    deleting,
    deleteDialogOpen,
    setDeleteDialogOpen: closeDeleteDialog,
    openDeleteDialog,
    handleDelete,
    formatDateTime,
  }
}
