"use client"

import * as React from "react"
import { toast } from "sonner"
import { getUserById, deleteUserById } from "@/services/user.service"
import { Role, UserWithMeta } from "@/types/user.types"

type UseViewUserOptions = {
  userId?: string
  onDeleted?: () => void
}

type State = {
  user: UserWithMeta | null
  loading: boolean
  deleting: boolean
  error: string
}

const normalizeRole = (value: unknown): Role => {
  if (value === "ADMIN") return "ADMIN"
  if (value === "PROJECT_MANAGER") return "PROJECT_MANAGER"
  if (value === "DEVELOPER") return "DEVELOPER"
  return "DEVELOPER"
}

const normalizeUser = (raw: any): UserWithMeta => {
  return {
    id: Number(raw.id),
    fullName: raw.fullName ?? raw.name ?? raw.full_name ?? "",
    email: raw.email ?? "",
    role: normalizeRole(raw.role ?? raw.user_role),
    passwordHash: String(raw.passwordHash ?? ""),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  }
}

export const useViewUser = (options: UseViewUserOptions) => {
  const { userId, onDeleted } = options

  const [state, setState] = React.useState<State>({
    user: null,
    loading: true,
    deleting: false,
    error: "",
  })

  const loadUser = React.useCallback(async () => {
    if (!userId) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "ID user tidak ditemukan.",
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }))

    try {
      const data = await getUserById(userId)
      const normalized = normalizeUser(data)
      setState({
        user: normalized,
        loading: false,
        deleting: false,
        error: "",
      })
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data user"
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }))
      toast.error("Gagal memuat user", {
        description: msg,
      })
    }
  }, [userId])

  React.useEffect(() => {
    loadUser()
  }, [loadUser])

  const handleDelete = React.useCallback(async () => {
    if (!state.user) return

    setState((prev) => ({
      ...prev,
      deleting: true,
      error: "",
    }))

    try {
      await deleteUserById(state.user.id)
      toast.success("User dihapus", {
        description: `User "${state.user.fullName}" berhasil dihapus.`,
      })
      if (onDeleted) onDeleted()
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal menghapus user"
      setState((prev) => ({
        ...prev,
        deleting: false,
        error: msg,
      }))
      toast.error("Gagal menghapus user", {
        description: msg,
      })
    }
  }, [state.user, onDeleted])

  return {
    user: state.user,
    loading: state.loading,
    deleting: state.deleting,
    error: state.error,
    handleDelete,
    reload: loadUser,
  }
}
