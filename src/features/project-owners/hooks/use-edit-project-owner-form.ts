"use client"

import * as React from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  projectOwnerSchema,
  type ProjectOwnerValues,
  type ProjectOwnerField,
} from "@/schemas/project-owner.schema"
import {
  getProjectOwnerById,
  updateProjectOwner,
} from "@/services/project-owner.service"
import { projectOwnerKeys } from "@/lib/query-keys"

type FieldErrors = Partial<Record<ProjectOwnerField, string>>

type UseEditProjectOwnerFormOptions = {
  ownerId?: string
  onSuccess?: () => void
}

const initialValues: ProjectOwnerValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
}

export const useEditProjectOwnerForm = (
  options: UseEditProjectOwnerFormOptions,
) => {
  const { ownerId, onSuccess } = options
  const queryClient = useQueryClient()

  const [form, setForm] = React.useState<ProjectOwnerValues>(initialValues)
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

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

  React.useEffect(() => {
    const loadOwner = async () => {
      if (!ownerId) {
        setErrorMsg("ID owner tidak ditemukan.")
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMsg(null)
      setErrors({})

      try {
        const owner = await getProjectOwnerById(ownerId)
        setForm({
          name: owner.name ?? "",
          company: owner.company ?? "",
          email: owner.email ?? "",
          phone: owner.phone ?? "",
          address: owner.address ?? "",
        })
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Gagal memuat data owner."
        setErrorMsg(msg)
        toast.error("Gagal memuat data owner", {
          description: msg,
        })
      } finally {
        setLoading(false)
      }
    }

    loadOwner()
  }, [ownerId])

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setErrorMsg(null)

      const nextErrors = validateAll(form)
      setErrors(nextErrors)
      const hasError = Object.values(nextErrors).some(Boolean)
      if (hasError) {
        toast.warning("Form belum valid", {
          description: "Periksa kembali data yang masih salah.",
        })
        return
      }

      if (!ownerId) {
        const msg = "ID owner tidak ditemukan."
        setErrorMsg(msg)
        toast.error("ID tidak valid", { description: msg })
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

        await updateProjectOwner(ownerId, payload)

        await queryClient.invalidateQueries({
          queryKey: projectOwnerKeys.all,
        })
        if (ownerId) {
          await queryClient.invalidateQueries({
            queryKey: projectOwnerKeys.detail(ownerId),
          })
        }

        toast.success("Perubahan berhasil disimpan", {
          description: `Owner "${payload.name}" telah diperbarui.`,
        })

        if (onSuccess) onSuccess()
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Gagal menyimpan perubahan. Coba lagi."

        setErrorMsg(msg)
        toast.error("Gagal menyimpan perubahan", {
          description: msg,
        })
      } finally {
        setSaving(false)
      }
    },
    [form, ownerId, onSuccess, queryClient, validateAll],
  )

  return {
    form,
    errors,
    loading,
    saving,
    errorMsg,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}
