"use client"

import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import type { ProjectAssignment } from "@/types/project-assignment.type"
import {
  fetchProjectAssignmentsWithPagination,
  deleteProjectAssignmentById,
  type ProjectAssignmentListParams,
  type ProjectAssignmentListResult,
} from "@/services/project-assignment.service"
import { projectAssignmentKeys } from "@/lib/query-keys"
import { usePagination } from "@/hooks/use-pagination"
import { buildSearchText, normalizeSearch } from "@/utils/search.util"

export type ProjectAssignmentColumns = {
  id: boolean
  project: boolean
  assignee: boolean
  roleInProject: boolean
  actions: boolean
}

type UseAdminProjectAssignmentsResult = {
  assignments: ProjectAssignment[]
  loading: boolean
  error: string
  search: string
  setSearch: (value: string) => void
  columns: ProjectAssignmentColumns
  setColumns: React.Dispatch<React.SetStateAction<ProjectAssignmentColumns>>
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  deleting: boolean
  requestDelete: (id: number) => void
  confirmDelete: () => Promise<void>
  pagination: ProjectAssignmentListResult["pagination"]
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const useAdminProjectAssignments = (): UseAdminProjectAssignmentsResult => {
  const queryClient = useQueryClient()
  const [error, setError] = React.useState("")
  const [search, setSearchState] = React.useState("")
  const [columns, setColumns] = React.useState<ProjectAssignmentColumns>({
    id: true,
    project: true,
    assignee: true,
    roleInProject: true,
    actions: true,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const { page, pageSize, onPageChange, onPageSizeChange, setPage } = usePagination()

  const filters = React.useMemo<ProjectAssignmentListParams>(() => {
    const trimmed = search.trim()
    return {
      page,
      pageSize,
      ...(trimmed ? { search: trimmed } : {}),
    }
  }, [search, page, pageSize])

  const queryKey = React.useMemo(
    () => projectAssignmentKeys.list(filters),
    [filters],
  )

  const assignmentsQuery = useQuery<ProjectAssignmentListResult>({
    queryKey,
    queryFn: () => fetchProjectAssignmentsWithPagination(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  React.useEffect(() => {
    if (assignmentsQuery.error) {
      const msg =
        assignmentsQuery.error instanceof Error
          ? assignmentsQuery.error.message
          : "Gagal memuat data project assignments"
      setError(msg)
      toast.error("Gagal memuat data assignments", { description: msg })
    } else if (assignmentsQuery.isSuccess) {
      setError("")
    }
  }, [assignmentsQuery.error, assignmentsQuery.isSuccess])

  const normalizedSearch = React.useMemo(
    () => normalizeSearch(search),
    [search],
  )

  const assignments = React.useMemo(() => {
    const list = assignmentsQuery.data?.assignments ?? []
    if (!normalizedSearch) return list
    return list.filter((assignment) => {
      const haystack = buildSearchText([
        assignment.id,
        assignment.projectName,
        assignment.assigneeName,
        assignment.roleInProject,
      ])
      return haystack.includes(normalizedSearch)
    })
  }, [assignmentsQuery.data?.assignments, normalizedSearch])
  const pagination = assignmentsQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const deleteMutation = useMutation({
    mutationFn: deleteProjectAssignmentById,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<ProjectAssignmentListResult>(queryKey)

      queryClient.setQueryData<ProjectAssignmentListResult>(queryKey, (current) => {
        if (!current) return current
        return {
          ...current,
          assignments: current.assignments.filter((a) => a.id !== id),
          pagination: {
            ...current.pagination,
            total: Math.max(0, current.pagination.total - 1),
          },
        }
      })

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

  const requestDelete = (id: number) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    const target = assignments.find((x) => x.id === deletingId)

    setDeleting(true)

    try {
      await deleteMutation.mutateAsync(deletingId)

      const label = target
        ? `${target.assigneeName ?? "User"} → ${
            target.projectName ?? "Project"
          }`
        : undefined

      toast.success("Assignment berhasil dihapus", {
        description: label,
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menghapus assignment."
      toast.error("Gagal menghapus assignment", { description: msg })
    } finally {
      setDeleting(false)
      setDeletingId(null)
      setDeleteDialogOpen(false)
    }
  }

  return {
    assignments,
    loading: assignmentsQuery.isLoading,
    error,
    search,
    setSearch: (value: string) => {
      setSearchState(value)
      setPage(1)
    },
    columns,
    setColumns,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleting,
    requestDelete,
    confirmDelete,
    pagination,
    page,
    pageSize,
    onPageChange: (next) => onPageChange(next, pagination.totalPages),
    onPageSizeChange,
  }
}
