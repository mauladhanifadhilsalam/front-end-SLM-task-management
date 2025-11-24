"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  projectOwnerSchema,
  type ProjectOwnerValues,
  type ProjectOwnerField,
} from "@/schemas/project-owner.schema"
import { createProjectOwner } from "@/services/project-owner.service"
import { ProjectOwner } from "@/types/project-owner.type"

type FieldErrors = Partial<Record<ProjectOwnerField, string>>

type UseCreateProjectOwnerFormOptions = {
  onSuccess?: (owner: ProjectOwner | void, values: ProjectOwnerValues) => void
}

const initialValues: ProjectOwnerValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
}

export const useCreateProjectOwnerForm = (
  options?: UseCreateProjectOwnerFormOptions,
) => {
  const [form, setForm] = React.useState<ProjectOwnerValues>(initialValues)
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [saving, setSaving] = React.useState(false)

  const validateAll = React.useCallback((values: ProjectOwnerValues) => {
    const parsed = projectOwnerSchema.safeParse(values)
    if (parsed.success) return {}
    const next: FieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ProjectOwnerField | undefined
      if (key && !next[key]) next[key] = issue.message
    }
    return next
  }, [])

  const validateField = React.useCallback(
    (name: ProjectOwnerField, value: string) => {
      const single = (projectOwnerSchema as any).pick({ [name]: true })
      const res = single.safeParse({ [name]: value })
      setErrors((prev) => ({
        ...prev,
        [name]: res.success ? undefined : res.error.issues[0]?.message,
      }))
    },
    [],
  )

  const handleChange = React.useCallback(
    (field: ProjectOwnerField, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        validateField(field, value)
      }
    },
    [errors, validateField],
  )

  const handleBlur = React.useCallback(
    (field: ProjectOwnerField) => {
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
          description:
            "Periksa kembali data project owner yang belum sesuai.",
        })
        return
      }

      setSaving(true)
      try {
        const payload = {
          name: form.name.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        }

        const created = await createProjectOwner(payload)

        toast.success("Project owner berhasil dibuat", {
          description: `Owner "${payload.name}" berhasil ditambahkan.`,
        })

        if (options?.onSuccess) {
          options.onSuccess(created, form)
        }

        setForm(initialValues)
        setErrors({})
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Gagal membuat owner. Coba lagi."
        toast.error("Gagal membuat project owner", {
          description: msg,
        })
      } finally {
        setSaving(false)
      }
    },
    [form, options, validateAll],
  )

  return {
    form,
    errors,
    saving,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}
