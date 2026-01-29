"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"
import {
  ProjectLite,
  UserLite,
  CreateProjectAssignmentPayload,
} from "@/types/project-assignment.type"
import { projectAssignmentCreateSchema, ProjectAssignmentCreateForm } from "@/schemas/project-assignment.schema"
import { createProjectAssignment } from "@/services/project-assignment.service"
import { projectAssignmentKeys } from "@/lib/query-keys"

const API_BASE = import.meta.env.VITE_API_BASE

export type CreateAssignmentFormState = ProjectAssignmentCreateForm
export type CreateAssignmentFormError = Partial<
  Record<keyof CreateAssignmentFormState, string>
>

type UseCreateProjectAssignmentFormResult = {
  projects: ProjectLite[]
  users: UserLite[]
  loadingProjects: boolean
  loadingUsers: boolean
  form: CreateAssignmentFormState
  errors: CreateAssignmentFormError
  saving: boolean
  handleChange: (field: keyof CreateAssignmentFormState, value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleCancel: () => void
}

export const useCreateProjectAssignmentForm =
  (): UseCreateProjectAssignmentFormResult => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [projects, setProjects] = React.useState<ProjectLite[]>([])
    const [users, setUsers] = React.useState<UserLite[]>([])
    const [loadingProjects, setLoadingProjects] = React.useState(false)
    const [loadingUsers, setLoadingUsers] = React.useState(false)

    const [form, setForm] = React.useState<CreateAssignmentFormState>({
      projectId: "",
      userId: "",
      note: "",
    })

    const [errors, setErrors] = React.useState<CreateAssignmentFormError>({})
    const [saving, setSaving] = React.useState(false)

    const handleChange = (
      field: keyof CreateAssignmentFormState,
      value: string,
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

    const validate = (
      values: CreateAssignmentFormState,
    ): CreateAssignmentFormError => {
      const res = projectAssignmentCreateSchema.safeParse(values)
      if (res.success) return {}

      const fieldErrors: CreateAssignmentFormError = {}
      const flattened = res.error.flatten().fieldErrors

      if (flattened.projectId?.[0]) {
        fieldErrors.projectId = flattened.projectId[0]
      }
      if (flattened.userId?.[0]) {
        fieldErrors.userId = flattened.userId[0]
      }

      return fieldErrors
    }

    const fetchProjects = React.useCallback(async () => {
      setLoadingProjects(true)
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/projects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const payload = res?.data?.data ?? res?.data ?? []
        const raw: any[] = Array.isArray(payload) ? payload : []
        const normalized: ProjectLite[] = raw.map((p) => ({
          id: Number(p.id),
          name: p.name ?? p.projectName ?? `Project #${p.id}`,
        }))
        setProjects(normalized)
      } finally {
        setLoadingProjects(false)
      }
    }, [])

    const fetchUsers = React.useCallback(async () => {
      setLoadingUsers(true)
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const payload = res?.data?.data ?? res?.data ?? []
        const raw: any[] = Array.isArray(payload) ? payload : []
        const normalized: UserLite[] = raw.map((u) => ({
          id: Number(u.id),
          fullName: u.fullName ?? u.name ?? `User #${u.id}`,
          email: u.email ?? "",
          projectRole: u.projectRole,
        }))
        setUsers(normalized)
      } finally {
        setLoadingUsers(false)
      }
    }, [])

    React.useEffect(() => {
      fetchProjects()
      fetchUsers()
    }, [fetchProjects, fetchUsers])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      const nextErrors = validate(form)
      setErrors(nextErrors)
      const hasError = Object.values(nextErrors).some(Boolean)
      if (hasError) return

      const payload: CreateProjectAssignmentPayload = {
        projectId: Number(form.projectId),
        userId: Number(form.userId),
      }

      try {
        setSaving(true)
        await createProjectAssignment(payload)

        await queryClient.invalidateQueries({
          queryKey: projectAssignmentKeys.all,
        })

        toast.success("Project assignment berhasil dibuat", {
          description: "Project assignment baru sudah tersimpan.",
        })

        navigate("/admin-dashboard/project-assignments")
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Gagal membuat project assignment. Coba lagi."
        toast.error("Gagal membuat project assignment", {
          description: msg,
        })
      } finally {
        setSaving(false)
      }
    }

    const handleCancel = () => {
        navigate("/admin-dashboard/project-assignments")
    }

    return {
        projects,
        users,
        loadingProjects,
        loadingUsers,
        form,
        errors,
        saving,
        handleChange,
        handleSubmit,
        handleCancel,
    }
}
