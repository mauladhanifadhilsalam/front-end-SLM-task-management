import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchProjectRoleByCode,
  updateProjectRoleByCode,
} from "@/services/project-role.service"
import { projectRoleKeys } from "@/lib/query-keys"
import type { ProjectRole } from "@/types/project-roles.type"

export type EditProjectRoleFormData = {
  code: string
  name: string
}

export type FieldErrors = Partial<Record<keyof EditProjectRoleFormData, string>>

export const useEditProjectRoleForm = () => {
  const { code: routeCode } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [form, setForm] = React.useState<EditProjectRoleFormData>({
    code: "",
    name: "",
  })
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [initialDataLoaded, setInitialDataLoaded] = React.useState(false)
  const [originalCode, setOriginalCode] = React.useState("")

  const {
    data: projectRole,
    isLoading: loading,
    error: queryError,
  } = useQuery<ProjectRole>({
    queryKey: projectRoleKeys.detail(routeCode ?? ""),
    queryFn: () => fetchProjectRoleByCode(routeCode!),
    enabled: !!routeCode,
  })

  React.useEffect(() => {
    if (projectRole && !initialDataLoaded) {
      setForm({
        code: projectRole.code,
        name: projectRole.name,
      })
      setOriginalCode(projectRole.code)
      setInitialDataLoaded(true)
    }
  }, [projectRole, initialDataLoaded])

  React.useEffect(() => {
    if (queryError) {
      const msg =
        queryError instanceof Error
          ? queryError.message
          : "Failed to load project role"
      setError(msg)
    }
  }, [queryError])

  const validate = (): boolean => {
    const errors: FieldErrors = {}

    // Code is optional in edit mode
    if (!form.name.trim()) {
      errors.name = "Name is required"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = React.useCallback(
    (field: keyof EditProjectRoleFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      setError("")
    },
    [],
  )

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validate() || !originalCode) return

      setSaving(true)
      setError("")

      try {
        // Only include code in payload if it was changed
        const payload: Partial<{ code: string; name: string }> = {
          name: form.name.trim(),
        }
        if (form.code.trim() && form.code.trim() !== originalCode) {
          payload.code = form.code.trim()
        }
        
        await updateProjectRoleByCode(originalCode, payload)

        await queryClient.invalidateQueries({ queryKey: projectRoleKeys.all })

        toast.success("Project Role updated", {
          description: `"${form.name}" has been updated successfully.`,
        })

        navigate("/admin/dashboard/project-roles")
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to update project role"
        setError(msg)
        toast.error("Update failed", { description: msg })
      } finally {
        setSaving(false)
      }
    },
    [form, originalCode, navigate, queryClient],
  )

  const handleCancel = React.useCallback(() => {
    navigate("/admin/dashboard/project-roles")
  }, [navigate])

  return {
    loading,
    saving,
    error,
    form,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleCancel,
  }
}
