import * as React from "react"
import { toast } from "sonner"
import type {
  TicketAssignee,
  TicketAssigneeColumns,
} from "@/types/ticket-assignee.type"
import {
  fetchTicketAssignees,
  deleteTicketAssignee,
} from "@/services/ticket-assignee.service"

type StatusFilter =
  | "all"
  | "NEW"
  | "TO_DO"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"

const defaultColumns: TicketAssigneeColumns = {
  id: true,
  ticket: true,
  assignee: true,
  type: true,
  priority: true,
  status: true,
  createdAt: true,
  actions: true,
}

export const useTicketAssignees = () => {
  const [assignees, setAssignees] = React.useState<TicketAssignee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilter>("all")
  const [cols, setCols] =
    React.useState<TicketAssigneeColumns>(defaultColumns)

  const loadAssignees = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const list = await fetchTicketAssignees()
      setAssignees(list)
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        "Gagal memuat data ticket assignee dari server."
      setError(msg)
      toast.error("Gagal memuat ticket assignments", {
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadAssignees()
  }, [loadAssignees])

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter)
  }

  const handleToggleColumn = (key: keyof TicketAssigneeColumns) => {
    setCols((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleDeleteAssignee = async (id: number) => {
    const target = assignees.find((a) => a.id === id)
    const prev = assignees

    setAssignees((list) => list.filter((a) => a.id !== id))

    try {
      await deleteTicketAssignee(id)

      toast.success("Assignment terhapus", {
        description: `Assignment #${id} (${target?.user.fullName ?? "Unknown"}) berhasil dihapus.`,
      })
    } catch (e: any) {
      setAssignees(prev)
      const msg =
        e?.response?.data?.message ||
        "Gagal menghapus assignment dari server."
      setError(msg)
      toast.error("Gagal menghapus assignment", {
        description: msg,
      })
    }
  }

  const filteredAssignees = React.useMemo(() => {
    const q = search.trim().toLowerCase()

    return assignees.filter((a) => {
      if (
        statusFilter !== "all" &&
        a.ticket.status !== statusFilter
      ) {
        return false
      }

      if (!q) return true

      const title = a.ticket.title.toLowerCase()
      const fullName = a.user.fullName.toLowerCase()
      const email = a.user.email.toLowerCase()

      return (
        title.includes(q) ||
        fullName.includes(q) ||
        email.includes(q)
      )
    })
  }, [assignees, search, statusFilter])

  const visibleColCount = React.useMemo(
    () => Object.values(cols).filter(Boolean).length,
    [cols],
  )

  return {
    assignees,
    loading,
    error,
    search,
    statusFilter,
    cols,
    filteredAssignees,
    visibleColCount,
    loadAssignees,
    handleSearchChange,
    handleStatusFilterChange,
    handleToggleColumn,
    handleDeleteAssignee,
  }
}
