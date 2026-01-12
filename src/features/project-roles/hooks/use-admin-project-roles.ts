import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchProjectRolesWithPagination,
  deleteProjectRoleById,
  type ProjectRoleListParams,
  type FetchProjectRolesResult,
  emptyProjectRolePagination,
} from "@/services/project-role.service"
import { projectRoleKeys } from "@/lib/query-keys"
import { buildSearchText, normalizeSearch } from "@/utils/search.util"

export type ProjectRoleTableColumns = {
  id: boolean
  code: boolean
  name: boolean
  actions: boolean
}

export const useAdminProjectRoles = () => {
  const queryClient = useQueryClient()
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [columns, setColumns] = React.useState<ProjectRoleTableColumns>({
    id: true,
    code: true,
    name: true,
    actions: true,
  })

  const filters = React.useMemo(() => {
    const params: ProjectRoleListParams = {
      page,
      pageSize,
    }

    const trimmedSearch = search.trim()
    if (trimmedSearch) {
      params.search = trimmedSearch
    }

    return params
  }, [search, page, pageSize])

  const queryKey = React.useMemo(() => projectRoleKeys.list(filters), [filters])

  const projectRolesQuery = useQuery<FetchProjectRolesResult>({
    queryKey,
    queryFn: () => fetchProjectRolesWithPagination(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  React.useEffect(() => {
    if (projectRolesQuery.error) {
      const msg =
        projectRolesQuery.error instanceof Error
          ? projectRolesQuery.error.message
          : "Gagal memuat data project roles"
      setError(msg)
    } else if (projectRolesQuery.isSuccess) {
      setError("")
    }
  }, [projectRolesQuery.error, projectRolesQuery.isSuccess])

  const normalizedSearch = React.useMemo(
    () => normalizeSearch(search),
    [search],
  )

  const projectRoles = React.useMemo(() => {
    const list = projectRolesQuery.data?.projectRoles ?? []
    if (!normalizedSearch) return list
    return list.filter((role) => {
      const haystack = buildSearchText([role.id, role.code, role.name])
      return haystack.includes(normalizedSearch)
    })
  }, [projectRolesQuery.data?.projectRoles, normalizedSearch])

  const pagination = projectRolesQuery.data?.pagination ?? emptyProjectRolePagination

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      const safeTotalPages = pagination.totalPages || 1
      const clamped = Math.max(1, Math.min(nextPage, safeTotalPages))
      setPage(clamped)
    },
    [pagination.totalPages],
  )

  const handlePageSizeChange = React.useCallback((nextSize: number) => {
    setPageSize(nextSize)
    setPage(1)
  }, [])

  const deleteMutation = useMutation({
    mutationFn: deleteProjectRoleById,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey })
      const previous =
        queryClient.getQueryData<FetchProjectRolesResult>(queryKey)

      queryClient.setQueryData<FetchProjectRolesResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            projectRoles: current.projectRoles.filter((r) => r.id !== id),
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

  const handleDeleteProjectRole = React.useCallback(
    async (id: number) => {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success("Project Role terhapus", {
          description: `Project Role #${id} berhasil dihapus.`,
        })
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal menghapus project role"
        setError(msg)
        toast.error("Gagal menghapus project role", {
          description: msg,
        })
      }
    },
    [deleteMutation],
  )

  const toggleColumn = React.useCallback(
    (key: keyof ProjectRoleTableColumns, value: boolean | "indeterminate") => {
      setColumns((current) => ({
        ...current,
        [key]: Boolean(value),
      }))
    },
    [],
  )

  return {
    projectRoles,
    loading: projectRolesQuery.isLoading,
    error,
    search,
    setSearch: handleSearchChange,
    pagination,
    page,
    pageSize,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    columns,
    toggleColumn,
    handleDeleteProjectRole,
    refetch: projectRolesQuery.refetch,
  }
}
