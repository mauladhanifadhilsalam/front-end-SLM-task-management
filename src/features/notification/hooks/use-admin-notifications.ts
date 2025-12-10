"use client"

import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchNotificationsWithPagination,
  deleteNotificationById,
  resendNotificationEmail,
  type NotificationListParams,
  type NotificationListResult,
} from "@/services/notification.service"
import type {
  Notification,
  NotificationState,
  NotifyStatusType,
  NotificationTargetType,
} from "@/types/notification.type"
import { notificationKeys } from "@/lib/query-keys"
import { usePagination } from "@/hooks/use-pagination"

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
  const [stateFilter, setStateFilter] = React.useState<
    NotificationState | "all"
  >("all")
  const {
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setPage,
  } = usePagination()

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

  const filters = React.useMemo<NotificationListParams>(() => {
    const params: NotificationListParams = {
      page,
      pageSize,
    }
    const trimmed = search.trim()
    if (trimmed) params.search = trimmed
    if (stateFilter !== "all") params.state = stateFilter
    return params
  }, [search, stateFilter, page, pageSize])

  const queryKey = React.useMemo(
    () => notificationKeys.adminList(filters),
    [filters],
  )

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: () => fetchNotificationsWithPagination(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const notifications = React.useMemo(() => {
    const list = notificationsQuery.data?.notifications ?? []
    return list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
  }, [notificationsQuery.data?.notifications])

  const pagination = notificationsQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

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

  const deleteMutation = useMutation({
    mutationFn: deleteNotificationById,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<NotificationListResult>(queryKey)

      queryClient.setQueryData<NotificationListResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            notifications: current.notifications.filter(
              (n) => n.id !== id,
            ),
            pagination: {
              ...current.pagination,
              total: Math.max(0, current.pagination.total - 1),
            },
          }
        },
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
      })
    },
  })

  const resendMutation = useMutation({
    mutationFn: resendNotificationEmail,
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationListResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            notifications: current.notifications.map((n) =>
              n.id === updated.id ? { ...n, ...updated } : n,
            ),
          }
        },
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

  const toggleColumn = (
    key: keyof ColState,
    value: boolean | "indeterminate",
  ) => setCols((c) => ({ ...c, [key]: !!value }))

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
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    stateFilter,
    setStateFilter: (value: NotificationState | "all") => {
      setStateFilter(value)
      setPage(1)
    },
    cols,
    toggleColumn,
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
    pagination,
    page,
    pageSize,
    setPage: (value: number) => onPageChange(value, pagination.totalPages),
    setPageSize: onPageSizeChange,
  }
}
