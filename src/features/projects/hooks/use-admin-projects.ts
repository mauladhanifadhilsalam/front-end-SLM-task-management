"use client"

import * as React from "react"
import { toast } from "sonner"
import { fetchProjects, deleteProjectById } from "@/services/project.service"
import { Project, ProjectStatus } from "@/types/project.type"

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

type State = {
  projects: Project[]
  loading: boolean
  error: string
  search: string
  statusFilter: StatusFilter
  columns: ProjectColumns
}

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

const initialState: State = {
  projects: [],
  loading: true,
  error: "",
  search: "",
  statusFilter: "all",
  columns: initialColumns,
}

export const useAdminProjects = () => {
  const [state, setState] = React.useState<State>(initialState)

  const loadProjects = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      const data = await fetchProjects()
      setState((prev) => ({
        ...prev,
        projects: data,
        loading: false,
        error: "",
      }))
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal memuat data proyek"
      setState((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }))
    }
  }, [])

  React.useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const setSearch = React.useCallback((value: string) => {
    setState((prev) => ({ ...prev, search: value }))
  }, [])

  const setStatusFilter = React.useCallback((value: StatusFilter) => {
    setState((prev) => ({ ...prev, statusFilter: value }))
  }, [])

  const toggleColumn = React.useCallback(
    (key: keyof ProjectColumns, value: boolean | "indeterminate") => {
      setState((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [key]: Boolean(value),
        },
      }))
    },
    [],
  )

  const filteredProjects = React.useMemo(() => {
    const ql = state.search.trim().toLowerCase()

    const filtered = state.projects.filter((p) => {
      if (state.statusFilter !== "all" && p.status !== state.statusFilter) {
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
  }, [state.projects, state.search, state.statusFilter])

  const colSpan = React.useMemo(
    () => Object.values(state.columns).filter(Boolean).length || 1,
    [state.columns],
  )

  const deleteProject = React.useCallback(
    async (id: number) => {
      const prev = state.projects
      const project = prev.find((p) => p.id === id)

      setState((current) => ({
        ...current,
        projects: current.projects.filter((p) => p.id !== id),
      }))

      try {
        await deleteProjectById(id)
        toast.success("Project deleted", {
          description: `Project ${project?.name ?? ""} berhasil dihapus.`,
        })
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal menghapus proyek"
        setState((current) => ({
          ...current,
          projects: prev,
        }))
        toast.error("Gagal menghapus project", { description: msg })
      }
    },
    [state.projects],
  )

  return {
    projects: state.projects,
    filteredProjects,
    loading: state.loading,
    error: state.error,
    search: state.search,
    statusFilter: state.statusFilter,
    columns: state.columns,
    colSpan,
    setSearch,
    setStatusFilter,
    toggleColumn,
    deleteProject,
    reload: loadProjects,
  }
}
