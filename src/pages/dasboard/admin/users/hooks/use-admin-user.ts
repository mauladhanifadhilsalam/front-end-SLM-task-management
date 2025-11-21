import * as React from "react"
import { User, Role } from "@/types/user.types"
import { fetchUsers, deleteUserById } from "@/services/user.service"
import { toast } from "sonner"

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
    const [users, setUsers] = React.useState<User[]>([])
    const [loading, setLoading] = React.useState(true)
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

const loadUsers = React.useCallback(async () => {
    try {
        setLoading(true)
        setError("")
        const data = await fetchUsers()
        setUsers(data)
    } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal memuat data users"
        setError(msg)
    } finally {
        setLoading(false)
    }
}, [])

    React.useEffect(() => {
        loadUsers()
    }, [loadUsers])

const handleDeleteUser = React.useCallback(
    async (id: number) => {
        const previous = users
        setUsers((current) => current.filter((u) => u.id !== id))

        try {
            await deleteUserById(id)
            toast.success("User terhapus", {
            description: `User #${id} berhasil dihapus.`,
            })
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Gagal menghapus user"
            setUsers(previous)
            setError(msg)
            toast.error("Gagal menghapus user", {
            description: msg,
            })
        }
        },
        [users],
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
        loading,
        error,
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        columns,
        toggleColumn,
        handleDeleteUser,
    }
}
