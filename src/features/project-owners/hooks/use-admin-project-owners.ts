"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  fetchProjectOwners,
  deleteProjectOwnerById,
} from "@/services/project-owner.service"
import { ProjectOwner } from "@/types/project-owner.type"

export type ProjectOwnerColumns = {
  id: boolean
  name: boolean
  email: boolean
  phone: boolean
  company: boolean
  address: boolean
  actions: boolean
}

export const useAdminProjectOwners = () => {
  const [owners, setOwners] = React.useState<ProjectOwner[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [columns, setColumns] = React.useState<ProjectOwnerColumns>({
    id: true,
    name: true,
    email: true,
    phone: true,
    company: true,
    address: true,
    actions: true,
  })

  const loadOwners = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await fetchProjectOwners()
      setOwners(data)
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Gagal memuat data project owners"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadOwners()
  }, [loadOwners])

  const filteredOwners = React.useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return owners
    return owners.filter(
      (o) =>
        String(o.name ?? "").toLowerCase().includes(s) ||
        String(o.email ?? "").toLowerCase().includes(s) ||
        String(o.company ?? "").toLowerCase().includes(s),
    )
  }, [owners, search])

  const colSpan = React.useMemo(
    () => Object.values(columns).filter(Boolean).length || 7,
    [columns],
  )

  const toggleColumn = React.useCallback(
    (key: keyof ProjectOwnerColumns, value: boolean | "indeterminate") => {
      setColumns((prev) => ({
        ...prev,
        [key]: Boolean(value),
      }))
    },
    [],
  )

  const deleteOwner = React.useCallback(
    async (id: number) => {
      const target = owners.find((o) => o.id === id)
      const prev = owners

      setOwners((current) => current.filter((o) => o.id !== id))

      try {
        await deleteProjectOwnerById(id)
        toast.success("Owner terhapus", {
          description: `${target?.name ?? "Owner"} berhasil dihapus.`,
        })
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Gagal menghapus owner."
        setOwners(prev)
        setError(msg)
        toast.error("Gagal menghapus owner", {
          description: msg,
        })
      }
    },
    [owners],
  )

  return {
    owners,
    filteredOwners,
    loading,
    error,
    search,
    setSearch,
    columns,
    colSpan,
    toggleColumn,
    deleteOwner,
  }
}
