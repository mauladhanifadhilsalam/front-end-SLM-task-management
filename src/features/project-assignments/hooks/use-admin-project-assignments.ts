"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  ProjectAssignment,
} from "@/types/project-assignment.type"
import {
  fetchProjectAssignments,
  deleteProjectAssignmentById,
} from "@/services/project-assignment.service"
import { projectAssignmentKeys } from "@/lib/query-keys"

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
    const queryClient = useQueryClient()
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

    const assignmentsQuery = useQuery({
      queryKey: projectAssignmentKeys.list(),
      queryFn: fetchProjectAssignments,
      staleTime: 30 * 1000,
    })

    const assignments = assignmentsQuery.data ?? []

    React.useEffect(() => {
      if (assignmentsQuery.error) {
        const msg =
          assignmentsQuery.error instanceof Error
            ? assignmentsQuery.error.message
            : "Gagal memuat data project assignments"
        setError(msg)
        toast.error("Gagal memuat data assignments", { description: msg })
      } else if (assignmentsQuery.isSuccess) {
        setError("")
      }
    }, [assignmentsQuery.error, assignmentsQuery.isSuccess])

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

    const deleteMutation = useMutation({
      mutationFn: deleteProjectAssignmentById,
      onMutate: async (id: number) => {
        await queryClient.cancelQueries({
          queryKey: projectAssignmentKeys.list(),
        })
        const previous =
          queryClient.getQueryData<ProjectAssignment[]>(
            projectAssignmentKeys.list(),
          ) ?? []

        queryClient.setQueryData<ProjectAssignment[]>(
          projectAssignmentKeys.list(),
          (current = []) => current.filter((a) => a.id !== id),
        )

        return { previous }
      },
      onError: (_err, _id, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            projectAssignmentKeys.list(),
            context.previous,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: projectAssignmentKeys.list(),
        })
      },
    })

    const requestDelete = (id: number) => {
      setDeletingId(id)
      setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
      if (!deletingId) return

      const target = assignments.find((x) => x.id === deletingId)

      setDeleting(true)

      try {
        await deleteMutation.mutateAsync(deletingId)

        toast.success("Assignment berhasil dihapus", {
          description:
            target
              ? `${target.assigneeName ?? "User"} – ${
                  target.projectName ?? "Project"
                }`
              : undefined,
        })
      } catch (err: any) {
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
      loading: assignmentsQuery.isLoading,
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
