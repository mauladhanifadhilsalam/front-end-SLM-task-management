"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchProjectOwners,
  deleteProjectOwnerById,
} from "@/services/project-owner.service"
import { ProjectOwner } from "@/types/project-owner.type"
import { projectOwnerKeys } from "@/lib/query-keys"

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
  const queryClient = useQueryClient()
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

  const ownersQuery = useQuery({
    queryKey: projectOwnerKeys.list(),
    queryFn: fetchProjectOwners,
    staleTime: 60 * 1000,
  })

  const owners = ownersQuery.data ?? []

  React.useEffect(() => {
    if (ownersQuery.error) {
      const msg =
        ownersQuery.error instanceof Error
          ? ownersQuery.error.message
          : "Gagal memuat data project owners"
      setError(msg)
    } else if (ownersQuery.isSuccess) {
      setError("")
    }
  }, [ownersQuery.error, ownersQuery.isSuccess])

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

  const deleteMutation = useMutation({
    mutationFn: deleteProjectOwnerById,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({
        queryKey: projectOwnerKeys.list(),
      })
      const previous =
        queryClient.getQueryData<ProjectOwner[]>(
          projectOwnerKeys.list(),
        ) ?? []

      queryClient.setQueryData<ProjectOwner[]>(
        projectOwnerKeys.list(),
        (current = []) => current.filter((o) => o.id !== id),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectOwnerKeys.list(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectOwnerKeys.list() })
    },
  })

  const deleteOwner = React.useCallback(
    async (id: number) => {
      const target = owners.find((o) => o.id === id)

      try {
        await deleteMutation.mutateAsync(id)
        toast.success("Owner terhapus", {
          description: `${target?.name ?? "Owner"} berhasil dihapus.`,
        })
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Gagal menghapus owner."
        setError(msg)
        toast.error("Gagal menghapus owner", {
          description: msg,
        })
      }
    },
    [deleteMutation, owners],
  )

  return {
    owners,
    filteredOwners,
    loading: ownersQuery.isLoading,
    error,
    search,
    setSearch,
    columns,
    colSpan,
    toggleColumn,
    deleteOwner,
  }
}
