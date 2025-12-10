import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AdminComment } from "@/types/comment.type"
import { fetchComments, deleteComment } from "@/services/comments.service"
import { commentKeys } from "@/lib/query-keys"

export type AdminCommentColumnState = {
  sel: boolean
  id: boolean
  ticket: boolean
  user: boolean
  message: boolean
  created: boolean
  actions: boolean
}

const defaultColumns: AdminCommentColumnState = {
  sel: true,
  id: true,
  ticket: true,
  user: true,
  message: true,
  created: true,
  actions: true,
}

export const useAdminCommentList = () => {
  const queryClient = useQueryClient()
  const [error, setError] = React.useState("")

  const [query, setQuery] = React.useState("")
  const [cols, setCols] = React.useState<AdminCommentColumnState>(
    defaultColumns,
  )

  const [page, setPage] = React.useState(1)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(
    new Set(),
  )

  const commentsQuery = useQuery({
    queryKey: commentKeys.adminList(),
    queryFn: fetchComments,
    staleTime: 30 * 1000,
  })

  const rows = commentsQuery.data ?? []
  const loading = commentsQuery.isLoading

  React.useEffect(() => {
    if (commentsQuery.error) {
      const msg =
        commentsQuery.error instanceof Error
          ? commentsQuery.error.message
          : "Failed to load comments"
      setError(msg)
      toast.error("Failed to load comments", { description: msg })
    } else if (commentsQuery.isSuccess) {
      setError("")
      setSelectedIds(new Set())
    }
  }, [commentsQuery.error, commentsQuery.isSuccess])

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return rows

    return rows.filter((c) => {
      const ticketId = String(c.ticketId)
      const ticketTitle = c.ticket?.title?.toLowerCase() ?? ""
      const projectName = c.ticket?.project?.name?.toLowerCase() ?? ""
      const message = c.message.toLowerCase()
      const userName =
        c.user?.fullName?.toLowerCase() ??
        c.user?.name?.toLowerCase() ??
        ""
      const userEmail = c.user?.email?.toLowerCase() ?? ""
      const userRole = c.user?.role?.toLowerCase() ?? ""

      return (
        message.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q) ||
        userRole.includes(q) ||
        ticketId.includes(q) ||
        ticketTitle.includes(q) ||
        projectName.includes(q)
      )
    })
  }, [rows, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages)
    if (page < 1) setPage(1)
  }, [page, totalPages])

  const pageStart = (page - 1) * rowsPerPage
  const pageEnd = pageStart + rowsPerPage
  const pageRows = filtered.slice(pageStart, pageEnd)

  const isRowSelected = (id: number) => selectedIds.has(id)

  const toggleRow = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const currentPageAllSelected =
    pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id))

  const toggleSelectAllOnPage = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (currentPageAllSelected) {
        pageRows.forEach((r) => next.delete(r.id))
      } else {
        pageRows.forEach((r) => next.add(r.id))
      }
      return next
    })

  const clearSelection = () => setSelectedIds(new Set())

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.adminList() })
      const previous =
        queryClient.getQueryData<AdminComment[]>(commentKeys.adminList()) ??
        []

      queryClient.setQueryData<AdminComment[]>(
        commentKeys.adminList(),
        (current = []) => current.filter((c) => c.id !== id),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(commentKeys.adminList(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.adminList() })
    },
  })

  const handleDelete = async (id: number) => {
    const target = rows.find((x) => x.id === id)

    setSelectedIds((s) => {
      const next = new Set(s)
      next.delete(id)
      return next
    })

    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Comment deleted", {
        description: target?.message
          ? `“${target.message.slice(0, 60)}${
              target.message.length > 60 ? "..." : ""
            }”`
          : `Comment #${id} berhasil dihapus.`,
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete comment"
      setError(msg)
      toast.error("Failed to delete comment", {
        description: msg,
      })
    }
  }

  const handleChangeRowsPerPage = (value: number) => {
    setRowsPerPage(value)
    setPage(1)
  }

  return {
    rows,
    loading,
    error,
    query,
    setQuery,
    cols,
    setCols,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage: handleChangeRowsPerPage,
    totalPages,
    pageRows,
    selectedIds,
    isRowSelected,
    toggleRow,
    currentPageAllSelected,
    toggleSelectAllOnPage,
    clearSelection,
    handleDelete,
    reload: commentsQuery.refetch,
  }
}
