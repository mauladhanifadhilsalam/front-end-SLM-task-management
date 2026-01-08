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
  fetchProjectOwnersWithPagination,
  deleteProjectOwnerById,
  type ProjectOwnerListParams,
  type ProjectOwnerListResult,
} from "@/services/project-owner.service"
import { ProjectOwner } from "@/types/project-owner.type"
import { projectOwnerKeys } from "@/lib/query-keys"
import { buildSearchText, normalizeSearch } from "@/utils/search.util"

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
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filters = React.useMemo<ProjectOwnerListParams>(() => {
    const trimmed = search.trim()
    return {
      page,
      pageSize,
      ...(trimmed ? { search: trimmed } : {}),
    }
  }, [search, page, pageSize])

  const queryKey = React.useMemo(
    () => projectOwnerKeys.list(filters),
    [filters],
  )

  const ownersQuery = useQuery<ProjectOwnerListResult>({
    queryKey,
    queryFn: () => fetchProjectOwnersWithPagination(filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })
  const normalizedSearch = React.useMemo(
    () => normalizeSearch(search),
    [search],
  )

  const owners = React.useMemo(() => {
    const list = ownersQuery.data?.owners ?? []
    if (!normalizedSearch) return list
    return list.filter((owner) => {
      const haystack = buildSearchText([
        owner.id,
        owner.name,
        owner.email,
        owner.phone,
        owner.company,
        owner.address,
      ])
      return haystack.includes(normalizedSearch)
    })
  }, [ownersQuery.data?.owners, normalizedSearch])
  const pagination = ownersQuery.data?.pagination ?? {
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

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
        queryKey,
      })
      const previous =
        queryClient.getQueryData<ProjectOwnerListResult>(queryKey)

      queryClient.setQueryData<ProjectOwnerListResult>(
        queryKey,
        (current) => {
          if (!current) return current
          return {
            ...current,
            owners: current.owners.filter((o) => o.id !== id),
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

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

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
    loading: ownersQuery.isLoading,
    error,
    search,
    setSearch: handleSearchChange,
    columns,
    colSpan,
    toggleColumn,
    deleteOwner,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  }
}
