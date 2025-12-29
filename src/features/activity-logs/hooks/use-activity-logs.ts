import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import type { ActivityLog, ActivityLogColumns } from "@/types/activity-log.type"
import {
  fetchActivityLogsWithPagination,
  deleteActivityLog,
  type ActivityLogListParams,
  type ActivityLogListResult,
} from "@/services/activity-log.service"
import { activityLogKeys } from "@/lib/query-keys"
import { usePagination } from "@/hooks/use-pagination"
import { buildSearchText, normalizeSearch } from "@/utils/search.util"

const defaultColumns: ActivityLogColumns = {
  id: true,
  action: true,
  user: true,
  role: true,
  targetType: true,
  targetId: true,
  details: true,
  occurredAt: true,
  actions: true,
}

export const useActivityLogs = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState("")
  const [cols, setCols] =
    React.useState<ActivityLogColumns>(defaultColumns)
  const {
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setPage,
  } = usePagination()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    React.useState(false)
  const [logToDelete, setLogToDelete] =
    React.useState<ActivityLog | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const filters = React.useMemo<ActivityLogListParams>(() => {
    const params: ActivityLogListParams = {
      page,
      pageSize,
    }
    const trimmed = search.trim()
    if (trimmed) params.search = trimmed
    return params
  }, [search, page, pageSize])

  const queryKey = React.useMemo(
    () => activityLogKeys.list(filters),
    [filters],
  )

  const logsQuery = useQuery({
    queryKey,
    queryFn: () => fetchActivityLogsWithPagination(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const logs = logsQuery.data?.logs ?? []
  const normalizedSearch = React.useMemo(
    () => normalizeSearch(search),
    [search],
  )
  const pagination = logsQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }
  const loading = logsQuery.isLoading
  const error = logsQuery.error
    ? logsQuery.error instanceof Error
      ? logsQuery.error.message
      : "Gagal memuat data."
    : ""

  React.useEffect(() => {
    if (error) {
      toast.error("Gagal memuat activity logs", { description: error })
    }
  }, [error])

  const deleteMutation = useMutation({
    mutationFn: deleteActivityLog,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<ActivityLogListResult>(queryKey)

      queryClient.setQueryData<ActivityLogListResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            logs: current.logs.filter((log) => log.id !== id),
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
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleToggleColumn = (key: keyof ActivityLogColumns) => {
    setCols((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const openDeleteDialog = (log: ActivityLog) => {
    setLogToDelete(log)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    if (isDeleting) return
    setIsDeleteDialogOpen(false)
    setLogToDelete(null)
  }

  const handleDeleteLog = async () => {
    if (!logToDelete) return

    setIsDeleting(true)

    try {
      await deleteMutation.mutateAsync(logToDelete.id)

      toast.success("Log berhasil dihapus", {
        description: `ID: ${logToDelete.id} ? ${logToDelete.action}`,
      })

      setIsDeleteDialogOpen(false)
      setLogToDelete(null)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal menghapus log."
      toast.error("Gagal menghapus log", { description: msg })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredLogs = React.useMemo(() => {
    if (!normalizedSearch) return logs
    return logs.filter((log) => {
      let details = ""
      try {
        details = log.details ? JSON.stringify(log.details) : ""
      } catch {
        details = ""
      }
      const haystack = buildSearchText([
        log.id,
        log.action,
        log.targetType,
        log.targetId,
        log.occurredAt,
        log.user?.fullName,
        log.user?.email,
        log.user?.role,
        details,
      ])
      return haystack.includes(normalizedSearch)
    })
  }, [logs, normalizedSearch])

  const visibleColCount = React.useMemo(
    () => Object.values(cols).filter(Boolean).length,
    [cols],
  )

  return {
    logs,
    loading,
    error,
    search,
    cols,
    isDeleteDialogOpen,
    logToDelete,
    isDeleting,
    filteredLogs,
    visibleColCount,
    pagination,
    page,
    pageSize,
    refetch: logsQuery.refetch,
    handleSearchChange,
    handleToggleColumn,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteLog,
    setPage: (value: number) => onPageChange(value, pagination.totalPages),
    setPageSize: onPageSizeChange,
  }
}
