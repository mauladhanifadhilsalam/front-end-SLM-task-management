"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  teamUpdateSchema,
  type TeamUpdateField,
  type TeamUpdateValues,
} from "@/schemas/team-update.schema"
import { updateTeamUpdate } from "@/services/team-update.service"
import type { TeamUpdate } from "@/types/team-update.type"
import { teamUpdateKeys } from "@/lib/query-keys"
import { useQueryClient } from "@tanstack/react-query"

type FieldErrors = Partial<Record<TeamUpdateField, string>>

type UseEditTeamUpdateFormOptions = {
  onSuccess?: (update: TeamUpdate | void, values: TeamUpdateValues) => void
}

const defaultValues: TeamUpdateValues = {
  projectId: "",
  yesterdayWork: "",
  todayWork: "",
  blocker: "",
  nextAction: "",
  status: "IN_PROGRESS",
}

export const useEditTeamUpdateForm = (
  updateId: number,
  initialValues?: TeamUpdateValues,
  options?: UseEditTeamUpdateFormOptions,
) => {
  const queryClient = useQueryClient()
  const [form, setForm] = React.useState<TeamUpdateValues>(
    initialValues ?? defaultValues,
  )
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [saving, setSaving] = React.useState(false)
  const didInit = React.useRef(false)

  React.useEffect(() => {
    if (didInit.current) return
    if (!initialValues) return
    setForm(initialValues)
    didInit.current = true
  }, [initialValues])

  const validateAll = React.useCallback((values: TeamUpdateValues) => {
    const parsed = teamUpdateSchema.safeParse(values)
    if (parsed.success) return {}
    const next: FieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as TeamUpdateField | undefined
      if (key && !next[key]) next[key] = issue.message
    }
    return next
  }, [])

  const validateField = React.useCallback(
    (name: TeamUpdateField, value: string) => {
      const single = (teamUpdateSchema as any).pick({ [name]: true })
      const res = single.safeParse({ [name]: value })
      setErrors((prev) => ({
        ...prev,
        [name]: res.success ? undefined : res.error.issues[0]?.message,
      }))
    },
    [],
  )

  const handleChange = React.useCallback(
    (field: TeamUpdateField, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        validateField(field, value)
      }
    },
    [errors, validateField],
  )

  const handleBlur = React.useCallback(
    (field: TeamUpdateField) => {
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
          yesterdayWork: form.yesterdayWork.trim(),
          todayWork: form.todayWork.trim(),
          blocker: form.blocker?.trim() ? form.blocker.trim() : null,
          nextAction: form.nextAction.trim(),
          status: form.status,
        }

        const updated = await updateTeamUpdate(updateId, payload)

        toast.success("Daily update berhasil diupdate", {
          description: "Perubahan sudah tersimpan.",
        })

        await queryClient.invalidateQueries({ queryKey: teamUpdateKeys.all })

        if (options?.onSuccess) {
          options.onSuccess(updated, form)
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Gagal update daily update. Coba lagi."
        toast.error("Gagal update daily update", {
          description: msg,
        })
      } finally {
        setSaving(false)
      }
    },
    [form, options, queryClient, updateId, validateAll],
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
