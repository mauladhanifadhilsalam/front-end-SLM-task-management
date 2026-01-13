"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  projectUpdateSchema,
  type ProjectUpdateField,
  type ProjectUpdateValues,
} from "@/schemas/project-update.schema"
import { createProjectUpdate, updateProjectUpdate } from "@/services/project-update.service"
import type { ProjectUpdate } from "@/types/project-update.type"
import { projectUpdateKeys } from "@/lib/query-keys"
import { useQueryClient } from "@tanstack/react-query"

type FieldErrors = Partial<Record<ProjectUpdateField, string>>

type UseProjectUpdateFormOptions = {
  mode: "create" | "edit"
  updateId?: number
  initialValues?: Partial<ProjectUpdateValues>
  onSuccess?: (update: ProjectUpdate | void, values: ProjectUpdateValues) => void
}

const defaultValues: ProjectUpdateValues = {
  projectId: "",
  phaseId: "",
  reportDate: new Date().toISOString().split("T")[0],
  participant: "",
  objective: "",
  progressHighlight: "",
  teamMood: "",
}

export const useProjectUpdateForm = (options: UseProjectUpdateFormOptions) => {
  const queryClient = useQueryClient()
  const [form, setForm] = React.useState<ProjectUpdateValues>(() => ({
    ...defaultValues,
    ...options.initialValues,
  }))
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (options.initialValues) {
      setForm((prev) => ({ ...prev, ...options.initialValues }))
    }
  }, [options.initialValues])

  const validateAll = React.useCallback((values: ProjectUpdateValues) => {
    const parsed = projectUpdateSchema.safeParse(values)
    if (parsed.success) return {}
    const next: FieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ProjectUpdateField | undefined
      if (key && !next[key]) next[key] = issue.message
    }
    return next
  }, [])

  const validateField = React.useCallback(
    (name: ProjectUpdateField, value: string) => {
      const single = (projectUpdateSchema as any).pick({ [name]: true })
      const res = single.safeParse({ [name]: value })
      setErrors((prev) => ({
        ...prev,
        [name]: res.success ? undefined : res.error.issues[0]?.message,
      }))
    },
    [],
  )

  const handleChange = React.useCallback(
    (field: ProjectUpdateField, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        validateField(field, value)
      }
    },
    [errors, validateField],
  )

  const handleBlur = React.useCallback(
    (field: ProjectUpdateField) => {
      validateField(field, form[field] as string)
    },
    [form, validateField],
  )

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const nextErrors = validateAll(form)
      setErrors(nextErrors)
      const hasError = Object.values(nextErrors).some(Boolean)
      if (hasError) {
        toast.warning("Form belum valid", {
          description: "Periksa kembali field yang masih kosong.",
        })
        return
      }

      setSaving(true)
      try {
        const payload = {
          projectId: Number(form.projectId),
          phaseId: form.phaseId ? Number(form.phaseId) : undefined,
          reportDate: form.reportDate,
          participant: form.participant?.trim() || undefined,
          objective: form.objective?.trim() || undefined,
          progressHighlight: form.progressHighlight?.trim() || undefined,
          teamMood: form.teamMood || undefined,
        }

        var result: ProjectUpdate | void = undefined

        if (options.mode === "create") {
          result = await createProjectUpdate(payload)
          toast.success("Project update berhasil dibuat", {
            description: "Update sudah tersimpan.",
          })
        } else if (options.mode === "edit" && options.updateId) {
          result = await updateProjectUpdate(options.updateId, payload)
          toast.success("Project update berhasil diperbarui", {
            description: "Perubahan sudah tersimpan.",
          })
        }

        await queryClient.invalidateQueries({ queryKey: projectUpdateKeys.all })

        if (options.onSuccess) {
          options.onSuccess(result, form)
        }

        if (options.mode === "create") {
          setForm(defaultValues)
          setErrors({})
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          `Gagal ${options.mode === "create" ? "membuat" : "memperbarui"} project update. Coba lagi.`
        toast.error(`Gagal ${options.mode === "create" ? "membuat" : "memperbarui"} project update`, {
          description: msg,
        })
      } finally {
        setSaving(false)
      }
    },
    [form, options, queryClient, validateAll],
  )

  return {
    form,
    errors,
    saving,
    handleChange,
    handleBlur,
    handleSubmit,
    setForm,
  }
}
