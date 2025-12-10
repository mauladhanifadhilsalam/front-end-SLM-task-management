"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { fetchProjects, deleteProjectById } from "@/services/project.service"
import { Project, ProjectStatus } from "@/types/project.type"
import { projectKeys } from "@/lib/query-keys"

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

  const projectsQuery = useQuery({
    queryKey: projectKeys.list(),
    queryFn: fetchProjects,
    staleTime: 60 * 1000,
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

  const projects = (projectsQuery.data ?? []) as Project[]

  const filteredProjects = React.useMemo(() => {
    const ql = search.trim().toLowerCase()

    const filtered = projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false
      }

      if (!ql) return true

      const name = p.name.toLowerCase()
      const notes = p.notes.toLowerCase()
      const ownerName = p.owner?.name?.toLowerCase?.() ?? ""
      const categories = p.categories.join(", ").toLowerCase()

      return (
        name.includes(ql) ||
        notes.includes(ql) ||
        ownerName.includes(ql) ||
        categories.includes(ql)
      )
    })

    return filtered.sort((a, b) => a.id - b.id)
  }, [projects, search, statusFilter])

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
      await queryClient.cancelQueries({ queryKey: projectKeys.list() })
      const previous =
        queryClient.getQueryData<Project[]>(projectKeys.list()) ?? []

      queryClient.setQueryData<Project[]>(
        projectKeys.list(),
        (current = []) => current.filter((p) => p.id !== id),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectKeys.list(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() })
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
    filteredProjects,
    loading: projectsQuery.isLoading,
    error,
    search,
    statusFilter,
    columns,
    colSpan,
    setSearch,
    setStatusFilter,
    toggleColumn,
    deleteProject,
    reload: projectsQuery.refetch,
  }
}
