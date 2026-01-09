"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createProjectUpdate,
  updateProjectUpdate,
  deleteProjectUpdate,
} from "@/services/project-update.service"
import { projectUpdateKeys } from "@/lib/query-keys"

export function useCreateProjectUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProjectUpdate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectUpdateKeys.list() })
      toast.success("Project update dibuat")
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Gagal membuat project update"
      toast.error(msg)
      throw err
    },
  })
}

export function useUpdateProjectUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: any) => updateProjectUpdate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectUpdateKeys.list() })
      toast.success("Project update diperbarui")
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Gagal memperbarui project update"
      toast.error(msg)
      throw err
    },
  })
}

export function useDeleteProjectUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProjectUpdate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectUpdateKeys.list() })
      toast.success("Project update dihapus")
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Gagal menghapus project update"
      toast.error(msg)
      throw err
    },
  })
}
