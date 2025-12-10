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
  fetchProjectsWithPagination,
  deleteProjectById,
  type ProjectListParams,
  type ProjectListResult,
} from "@/services/project.service"
import { Project, ProjectStatus } from "@/types/project.type"
import { projectKeys } from "@/lib/query-keys"
import { usePagination } from "@/hooks/use-pagination"

export type ProjectColumns = {
  id: boolean
  name: boolean
  categories: boolean
  owner: boolean
  status: boolean
  completion: boolean
  startDate: boolean
  endDate: boolean
  actions: boolean
}

export type StatusFilter = "all" | ProjectStatus

const initialColumns: ProjectColumns = {
  id: true,
  name: true,
  categories: true,
  owner: true,
  status: true,
  completion: true,
  startDate: true,
  endDate: true,
  actions: true,
}

export const useAdminProjects = () => {
  const queryClient = useQueryClient()
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [columns, setColumns] = React.useState<ProjectColumns>(initialColumns)
  const {
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setPage,
  } = usePagination()

  const filters = React.useMemo(() => {
    const params: ProjectListParams = {
      page,
      pageSize,
    }
    const trimmed = search.trim()
    if (trimmed) {
      params.search = trimmed
    }
    if (statusFilter !== "all") {
      params.status = statusFilter
    }

    return params
  }, [search, statusFilter, page, pageSize])

  const queryKey = React.useMemo(() => projectKeys.list(filters), [filters])

  const projectsQuery = useQuery<ProjectListResult>({
    queryKey,
    queryFn: () => fetchProjectsWithPagination(filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

  React.useEffect(() => {
    if (projectsQuery.error) {
      const msg =
        projectsQuery.error instanceof Error
          ? projectsQuery.error.message
          : "Gagal memuat data proyek"
      setError(msg)
    } else if (projectsQuery.isSuccess) {
      setError("")
    }
  }, [projectsQuery.error, projectsQuery.isSuccess])

  const projects = React.useMemo(() => {
    const list = projectsQuery.data?.projects ?? []
    return list.slice().sort((a, b) => a.id - b.id)
  }, [projectsQuery.data?.projects])

  const pagination = projectsQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const colSpan = React.useMemo(
    () => Object.values(columns).filter(Boolean).length || 1,
    [columns],
  )

  const toggleColumn = React.useCallback(
    (key: keyof ProjectColumns, value: boolean | "indeterminate") => {
      setColumns((prev) => ({
        ...prev,
        [key]: Boolean(value),
      }))
    },
    [],
  )

  const deleteMutation = useMutation({
    mutationFn: deleteProjectById,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<ProjectListResult>(queryKey)

      queryClient.setQueryData<ProjectListResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            projects: current.projects.filter((p) => p.id !== id),
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

  const deleteProject = React.useCallback(
    async (id: number) => {
      const project = projects.find((p) => p.id === id)
      try {
        await deleteMutation.mutateAsync(id)
        toast.success("Project deleted", {
          description: `Project ${project?.name ?? ""} berhasil dihapus.`,
        })
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal menghapus proyek"
        setError(msg)
        toast.error("Gagal menghapus project", { description: msg })
      }
    },
    [deleteMutation, projects],
  )

  return {
    projects,
    loading: projectsQuery.isLoading,
    error,
    search,
    statusFilter,
    columns,
    colSpan,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    setStatusFilter: (value: StatusFilter) => {
      setStatusFilter(value)
      setPage(1)
    },
    toggleColumn,
    deleteProject,
    pagination,
    page,
    pageSize,
    setPage: (value: number) => onPageChange(value, pagination.totalPages),
    setPageSize: onPageSizeChange,
    reload: projectsQuery.refetch,
  }
}
