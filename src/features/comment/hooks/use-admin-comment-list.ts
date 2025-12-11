import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import type { AdminComment } from "@/types/comment.type"
import {
  fetchCommentsWithPagination,
  deleteComment,
  type CommentListParams,
  type CommentListResult,
} from "@/services/comments.service"
import { commentKeys } from "@/lib/query-keys"
import { usePagination } from "@/hooks/use-pagination"

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

  const {
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setPage,
  } = usePagination()

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(
    new Set(),
  )

  const filters = React.useMemo<CommentListParams>(() => {
    const params: CommentListParams = {
      page,
      pageSize,
    }
    const trimmed = query.trim()
    if (trimmed) params.search = trimmed
    return params
  }, [query, page, pageSize])

  const queryKey = React.useMemo(
    () => commentKeys.adminList(filters),
    [filters],
  )

  const commentsQuery = useQuery({
    queryKey,
    queryFn: () => fetchCommentsWithPagination(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const rows = React.useMemo(() => {
    const list = commentsQuery.data?.comments ?? []
    return list.slice().sort((a, b) => b.id - a.id)
  }, [commentsQuery.data?.comments])

  const loading = commentsQuery.isLoading
  const pagination = commentsQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

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

  const isRowSelected = (id: number) => selectedIds.has(id)

  const toggleRow = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const currentPageAllSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id))

  const toggleSelectAllOnPage = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (currentPageAllSelected) {
        rows.forEach((r) => next.delete(r.id))
      } else {
        rows.forEach((r) => next.add(r.id))
      }
      return next
    })

  const clearSelection = () => setSelectedIds(new Set())

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<CommentListResult>(queryKey)

      queryClient.setQueryData<CommentListResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            comments: current.comments.filter((c) => c.id !== id),
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

  return {
    rows,
    loading,
    error,
    query,
    setQuery: (value: string) => {
      setQuery(value)
      setPage(1)
    },
    cols,
    setCols,
    page,
    setPage: (value: number) => onPageChange(value, pagination.totalPages),
    rowsPerPage: pageSize,
    setRowsPerPage: onPageSizeChange,
    selectedIds,
    isRowSelected,
    toggleRow,
    currentPageAllSelected,
    toggleSelectAllOnPage,
    clearSelection,
    handleDelete,
    reload: commentsQuery.refetch,
    pagination,
    pageSize,
  }
}
