import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { Role } from "@/types/user.types"
import {
  fetchUsersWithPagination,
  deleteUserById,
  type UserListParams,
  type FetchUsersResult,
  emptyUserPagination,
} from "@/services/user.service"
import { userKeys } from "@/lib/query-keys"

type ManagedRole = Extract<Role, "PROJECT_MANAGER" | "DEVELOPER">
export type RoleFilter = ManagedRole | "all"

export type UserTableColumns = {
    id: boolean
    fullName: boolean
    email: boolean
    passwordHash: boolean
    role: boolean
    actions: boolean
}

export const useAdminUsers = () => {
    const queryClient = useQueryClient()
    const [error, setError] = React.useState("")
    const [search, setSearch] = React.useState("")
    const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all")
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)
    const [columns, setColumns] = React.useState<UserTableColumns>({
        id: true,
        fullName: true,
        email: true,
        passwordHash: false,
        role: true,
        actions: true,
})

const filters = React.useMemo(() => {
  const params: UserListParams = {
    page,
    pageSize,
  }

  const trimmedSearch = search.trim()
  if (trimmedSearch) {
    params.search = trimmedSearch
  }
  if (roleFilter !== "all") {
    params.role = roleFilter
  }

  return params
}, [search, roleFilter, page, pageSize])

const queryKey = React.useMemo(() => userKeys.list(filters), [filters])

const usersQuery = useQuery<FetchUsersResult>({
    queryKey,
    queryFn: () => fetchUsersWithPagination(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
})

React.useEffect(() => {
    if (usersQuery.error) {
        const msg =
            usersQuery.error instanceof Error
                ? usersQuery.error.message
                : "Gagal memuat data users"
        setError(msg)
    } else if (usersQuery.isSuccess) {
        setError("")
    }
}, [usersQuery.error, usersQuery.isSuccess])

const users = usersQuery.data?.users ?? []
const pagination = usersQuery.data?.pagination ?? emptyUserPagination

const handleSearchChange = React.useCallback((value: string) => {
  setSearch(value)
  setPage(1)
}, [])

const handleRoleFilterChange = React.useCallback((value: RoleFilter) => {
  setRoleFilter(value)
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
    mutationFn: deleteUserById,
    onMutate: async (id: number) => {
        await queryClient.cancelQueries({ queryKey })
        const previous =
            queryClient.getQueryData<FetchUsersResult>(queryKey)

        queryClient.setQueryData<FetchUsersResult>(
            queryKey,
            (current) => {
                if (!current) return current
                return {
                    ...current,
                    users: current.users.filter((u) => u.id !== id),
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

const handleDeleteUser = React.useCallback(
    async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success("User terhapus", {
                description: `User #${id} berhasil dihapus.`,
            })
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Gagal menghapus user"
            setError(msg)
            toast.error("Gagal menghapus user", {
                description: msg,
            })
        }
    },
    [deleteMutation],
)

const toggleColumn = React.useCallback(
        (key: keyof UserTableColumns, value: boolean | "indeterminate") => {
        setColumns((current) => ({
            ...current,
            [key]: Boolean(value),
        }))
        },
        [],
    )

return {
        users,
        loading: usersQuery.isLoading,
        error,
        search,
        setSearch: handleSearchChange,
        roleFilter,
        setRoleFilter: handleRoleFilterChange,
        pagination,
        page,
        pageSize,
        setPage: handlePageChange,
        setPageSize: handlePageSizeChange,
        columns,
        toggleColumn,
        handleDeleteUser,
        refetch: usersQuery.refetch,
    }
}
