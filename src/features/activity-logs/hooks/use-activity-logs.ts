import * as React from "react"
import { toast } from "sonner"
import type { ActivityLog, ActivityLogColumns } from "@/types/activity-log.type"
import {
  fetchActivityLogs,
  deleteActivityLog,
} from "@/services/activity-log.service"

type UseActivityLogsState = {
  logs: ActivityLog[]
  loading: boolean
  error: string
  search: string
  cols: ActivityLogColumns
  isDeleteDialogOpen: boolean
  logToDelete: ActivityLog | null
  isDeleting: boolean
}

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
  const [logs, setLogs] = React.useState<ActivityLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [cols, setCols] =
    React.useState<ActivityLogColumns>(defaultColumns)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    React.useState(false)
  const [logToDelete, setLogToDelete] =
    React.useState<ActivityLog | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const loadLogs = React.useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const list = await fetchActivityLogs()
      setLogs(list)
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Gagal memuat data."
      setError(msg)
      toast.error("Gagal memuat activity logs", {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleSearchChange = (value: string) => {
    setSearch(value)
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
    setError("")
    const prev = logs
    setLogs((p) => p.filter((l) => l.id !== logToDelete.id))

    try {
      await deleteActivityLog(logToDelete.id)

      toast.success("Log berhasil dihapus", {
        description: `ID: ${logToDelete.id} • ${logToDelete.action}`,
      })

      setIsDeleteDialogOpen(false)
      setLogToDelete(null)
    } catch (e: any) {
      setLogs(prev)
      const msg =
        e?.response?.data?.message || "Gagal menghapus log."
      setError(msg)
      toast.error("Gagal menghapus log", {
        description: msg,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredLogs = React.useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return logs
    return logs.filter((log) => {
      const action = log.action.toLowerCase()
      const targetType = log.targetType.toLowerCase()
      const fullName = log.user.fullName.toLowerCase()
      const email = log.user.email.toLowerCase()
      const role = log.user.role.toLowerCase()

      return (
        action.includes(q) ||
        targetType.includes(q) ||
        fullName.includes(q) ||
        email.includes(q) ||
        role.includes(q)
      )
    })
  }, [logs, search])

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
    loadLogs,
    handleSearchChange,
    handleToggleColumn,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteLog,
  }
}
