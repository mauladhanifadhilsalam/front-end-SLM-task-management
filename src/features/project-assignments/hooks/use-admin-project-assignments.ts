"use client"

import * as React from "react"
import { toast } from "sonner"
import type {
  ProjectAssignment,
} from "@/types/project-assignment.type"
import {
  fetchProjectAssignments,
  deleteProjectAssignmentById,
} from "@/services/project-assignment.service"

export type ProjectAssignmentColumns = {
  id: boolean
  project: boolean
  assignee: boolean
  roleInProject: boolean
  actions: boolean
}

type UseAdminProjectAssignmentsResult = {
  assignments: ProjectAssignment[]
  filteredAssignments: ProjectAssignment[]
  loading: boolean
  error: string
  search: string
  setSearch: (value: string) => void
  columns: ProjectAssignmentColumns
  setColumns: React.Dispatch<React.SetStateAction<ProjectAssignmentColumns>>
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  deleting: boolean
  requestDelete: (id: number) => void
  confirmDelete: () => Promise<void>
}

export const useAdminProjectAssignments =
  (): UseAdminProjectAssignmentsResult => {
    const [assignments, setAssignments] = React.useState<ProjectAssignment[]>(
      [],
    )
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState("")
    const [search, setSearch] = React.useState("")

    const [columns, setColumns] = React.useState<ProjectAssignmentColumns>({
      id: true,
      project: true,
      assignee: true,
      roleInProject: true,
      actions: true,
    })

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [deletingId, setDeletingId] = React.useState<number | null>(null)
    const [deleting, setDeleting] = React.useState(false)

    const loadAssignments = React.useCallback(async () => {
      setLoading(true)
      setError("")

      try {
        const data = await fetchProjectAssignments()
        setAssignments(data)
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          "Gagal memuat data project assignments"
        setError(msg)
        toast.error("Gagal memuat data assignments", { description: msg })
      } finally {
        setLoading(false)
      }
    }, [])

    React.useEffect(() => {
      loadAssignments()
    }, [loadAssignments])

    const filteredAssignments = React.useMemo(() => {
      const s = search.trim().toLowerCase()
      if (!s) return assignments

      return assignments.filter((a) => {
        const project = String(a.projectName ?? "").toLowerCase()
        const assignee = String(a.assigneeName ?? "").toLowerCase()
        const role = String(a.roleInProject ?? "").toLowerCase()
        return (
          project.includes(s) ||
          assignee.includes(s) ||
          role.includes(s) ||
          status.includes(s)
        )
      })
    }, [assignments, search])

    const requestDelete = (id: number) => {
      setDeletingId(id)
      setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
      if (!deletingId) return

      const target = assignments.find((x) => x.id === deletingId)
      const prev = assignments

      setDeleting(true)
      setAssignments((p) => p.filter((x) => x.id !== deletingId))

      try {
        await deleteProjectAssignmentById(deletingId)

        toast.success("Assignment berhasil dihapus", {
          description:
            target
              ? `${target.assigneeName ?? "User"} – ${
                  target.projectName ?? "Project"
                }`
              : undefined,
        })
      } catch (err: any) {
        setAssignments(prev)
        const msg =
          err?.response?.data?.message || "Gagal menghapus assignment."
        toast.error("Gagal menghapus assignment", { description: msg })
      } finally {
        setDeleting(false)
        setDeletingId(null)
        setDeleteDialogOpen(false)
      }
    }

    return {
      assignments,
      filteredAssignments,
      loading,
      error,
      search,
      setSearch,
      columns,
      setColumns,
      deleteDialogOpen,
      setDeleteDialogOpen,
      deleting,
      requestDelete,
      confirmDelete,
    }
  }
