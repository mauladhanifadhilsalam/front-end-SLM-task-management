import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { createProjectRole } from "@/services/project-role.service"
import { projectRoleKeys } from "@/lib/query-keys"

export type CreateProjectRoleFormData = {
  code: string
  name: string
}

export type FieldErrors = Partial<Record<keyof CreateProjectRoleFormData, string>>

const emptyForm: CreateProjectRoleFormData = {
  code: "",
  name: "",
}

export const useCreateProjectRoleForm = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [form, setForm] = React.useState<CreateProjectRoleFormData>(emptyForm)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  const validate = (): boolean => {
    const errors: FieldErrors = {}

    if (!form.code.trim()) {
      errors.code = "Code is required"
    }
    if (!form.name.trim()) {
      errors.name = "Name is required"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = React.useCallback(
    (field: keyof CreateProjectRoleFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      setError("")
    },
    [],
  )

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validate()) return

      setSaving(true)
      setError("")

      try {
        await createProjectRole({
          code: form.code.trim(),
          name: form.name.trim(),
        })

        await queryClient.invalidateQueries({ queryKey: projectRoleKeys.all })

        toast.success("Project Role created", {
          description: `"${form.name}" has been created successfully.`,
        })

        navigate("/admin/dashboard/project-roles")
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to create project role"
        setError(msg)
        toast.error("Create failed", { description: msg })
      } finally {
        setSaving(false)
      }
    },
    [form, navigate, queryClient],
  )

  const handleCancel = React.useCallback(() => {
    navigate("/admin/dashboard/project-roles")
  }, [navigate])

  return {
    saving,
    error,
    form,
    fieldErrors,
    handleChange,
    handleSubmit,
    handleCancel,
  }
}
