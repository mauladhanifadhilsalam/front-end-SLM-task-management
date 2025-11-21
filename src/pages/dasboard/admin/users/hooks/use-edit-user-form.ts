"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  editUserSchema,
  type EditUserValues,
  type EditUserField,
  RoleEnum,
  toEditPayload,
} from "@/schemas/users.schema"
import { getUserById, updateUser } from "@/services/user.service"

type FieldErrors = Partial<Record<EditUserField, string>>

type UseEditUserFormOptions = {
  userId?: string
  onSuccess?: () => void
}

const normalizeRole = (value: unknown): EditUserValues["role"] => {
  if (value === RoleEnum.enum.PROJECT_MANAGER) {
    return RoleEnum.enum.PROJECT_MANAGER
  }
  if (value === RoleEnum.enum.DEVELOPER) {
    return RoleEnum.enum.DEVELOPER
  }
  return RoleEnum.enum.DEVELOPER
}

export const useEditUserForm = (options: UseEditUserFormOptions) => {
  const { userId, onSuccess } = options

  const [form, setForm] = React.useState<EditUserValues>({
    fullName: "",
    email: "",
    role: RoleEnum.enum.DEVELOPER,
    password: "",
  })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  React.useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        setLoading(false)
        setErrorMsg("ID user tidak ditemukan.")
        return
      }

      setLoading(true)
      setErrorMsg(null)
      setFieldErrors({})

      try {
        const data = await getUserById(userId)
        setForm({
          fullName: data.fullName ?? data.name ?? data.full_name ?? "",
          email: data.email ?? "",
          role: normalizeRole(data.role ?? data.user_role),
          password: "",
        })
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Gagal memuat data user."
        setErrorMsg(msg)
        toast.error("Gagal memuat user", {
          description: msg,
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [userId])

  const handleChange = React.useCallback(
    (field: EditUserField, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value as any }))

      if (fieldErrors[field]) {
        const singleSchema = (editUserSchema as any).pick({ [field]: true })
        const result = singleSchema.safeParse({ [field]: value })
        setFieldErrors((prev) => ({
          ...prev,
          [field]: result.success
            ? undefined
            : result.error.issues[0]?.message,
        }))
      }
    },
    [fieldErrors],
  )

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!userId) return

      setSaving(true)
      setErrorMsg(null)
      setFieldErrors({})

      const parsed = editUserSchema.safeParse(form)
      if (!parsed.success) {
        const fe: FieldErrors = {}
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as EditUserField
          if (!fe[key]) fe[key] = issue.message
        }
        setFieldErrors(fe)
        setSaving(false)
        return
      }

      const payload = toEditPayload(parsed.data)

      try {
        await updateUser(userId, payload)

        toast.success("Perubahan disimpan", {
          description: "Perubahan user berhasil disimpan.",
        })

        if (onSuccess) onSuccess()
      } catch (err: any) {
        let msg = "Gagal menyimpan perubahan."

        if (err?.response?.status === 400 && err.response.data) {
          const zodFmt = err.response.data
          const fe: FieldErrors = {}

          if (zodFmt?.fullName?._errors?.[0]) {
            fe.fullName = zodFmt.fullName._errors[0]
          }
          if (zodFmt?.email?._errors?.[0]) {
            fe.email = zodFmt.email._errors[0]
          }
          if (zodFmt?.role?._errors?.[0]) {
            fe.role = zodFmt.role._errors[0]
          }
          if (zodFmt?.password?._errors?.[0]) {
            fe.password = zodFmt.password._errors[0]
          }

          if (Object.keys(fe).length > 0) {
            setFieldErrors(fe)
            msg =
              fe.fullName ||
              fe.email ||
              fe.role ||
              fe.password ||
              "Data tidak valid."
          } else {
            msg =
              zodFmt?._errors?.[0] ||
              err?.response?.data?.message ||
              "Data tidak valid."
          }
        } else {
          msg = err?.response?.data?.message || "Gagal menyimpan perubahan."
        }

        setErrorMsg(msg)
        toast.error("Gagal menyimpan perubahan", {
          description: msg,
        })
      } finally {
        setSaving(false)
      }
    },
    [form, onSuccess, userId],
  )

return {
    form,
    loading,
    saving,
    errorMsg,
    fieldErrors,
    handleChange,
    handleSubmit,
}
}
