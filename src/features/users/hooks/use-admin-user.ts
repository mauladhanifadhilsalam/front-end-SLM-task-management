import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { User, Role } from "@/types/user.types"
import { fetchUsers, deleteUserById } from "@/services/user.service"
import { userKeys } from "@/lib/query-keys"

type RoleFilter = Role | "all"

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
    const [columns, setColumns] = React.useState<UserTableColumns>({
        id: true,
        fullName: true,
        email: true,
        passwordHash: false,
        role: true,
        actions: true,
})

const usersQuery = useQuery({
    queryKey: userKeys.list(),
    queryFn: fetchUsers,
    staleTime: 30 * 1000,
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

const users = usersQuery.data ?? []

const deleteMutation = useMutation({
    mutationFn: deleteUserById,
    onMutate: async (id: number) => {
        await queryClient.cancelQueries({ queryKey: userKeys.list() })
        const previous =
            queryClient.getQueryData<User[]>(userKeys.list()) ?? []

        queryClient.setQueryData<User[]>(
            userKeys.list(),
            (current = []) => current.filter((u) => u.id !== id),
        )

        return { previous }
    },
    onError: (_err, _id, context) => {
        if (context?.previous) {
            queryClient.setQueryData(userKeys.list(), context.previous)
        }
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.list() })
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

const filteredUsers = React.useMemo(() => {
    const q = search.trim().toLowerCase()

    return users.filter((u) => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false
        if (!q) return true
        return (
            u.fullName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        )
        })
    }, [users, search, roleFilter])

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
        filteredUsers,
        loading: usersQuery.isLoading,
        error,
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        columns,
        toggleColumn,
        handleDeleteUser,
        refetch: usersQuery.refetch,
    }
}
