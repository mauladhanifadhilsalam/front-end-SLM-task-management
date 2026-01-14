"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  createUserSchema,
  type CreateUserValues,
  type CreateUserField,
} from "@/schemas/users.schema"
import { createUser } from "@/services/user.service"
import { User } from "@/types/user.types"

type UseCreateUserFormOptions = {
  onSuccess?: (user: User) => void
}

type FieldErrors = Partial<Record<CreateUserField, string | null>>

const initialValues: CreateUserValues = {
  fullName: "",
  email: "",
  role: "PROJECT_MANAGER",
  password: "",
  projectRole: "",
}

export const useCreateUserForm = (options?: UseCreateUserFormOptions) => {
  const [formData, setFormData] = React.useState<CreateUserValues>(
    initialValues,
  )
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})
  const [loading, setLoading] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const handleInputChange = React.useCallback(
    (field: CreateUserField, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      if (fieldErrors[field]) {
        const singleSchema = (createUserSchema as any).pick({ [field]: true })
        const result = singleSchema.safeParse({ [field]: value })

        setFieldErrors((prev) => ({
          ...prev,
          [field]: result.success
            ? null
            : result.error.issues[0]?.message ?? null,
        }))
      }
    },
    [fieldErrors],
  )

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setErrorMsg(null)
      setSuccessMsg(null)
      setFieldErrors({})

      const parsed = createUserSchema.safeParse(formData)
      if (!parsed.success) {
        const newErrors: FieldErrors = {}
        for (const issue of parsed.error.issues) {
          const path = issue.path[0] as CreateUserField
          if (path && !newErrors[path]) newErrors[path] = issue.message
        }
        setFieldErrors(newErrors)
        setLoading(false)
        return
      }

      try {
        const createdUser = await createUser(parsed.data)

        setSuccessMsg(`User "${createdUser.fullName}" berhasil dibuat.`)
        toast.success("User berhasil dibuat", {
          description: `User "${createdUser.fullName}" berhasil dibuat.`,
        })

        if (options?.onSuccess) {
          options.onSuccess(createdUser)
        }

        setFormData(initialValues)
      } catch (err: any) {
        let message = "Gagal membuat user."

        if (err?.response?.status === 400 && err.response.data) {
          const zodFmt = err.response.data
          const firstIssue =
            zodFmt?.fullName?._errors?.[0] ||
            zodFmt?.email?._errors?.[0] ||
            zodFmt?.role?._errors?.[0] ||
            zodFmt?.password?._errors?.[0] ||
            zodFmt?._errors?.[0]

          message = firstIssue || "Data tidak valid."
        } else if (err?.response?.status === 409) {
          message = err.response.data?.message || "Email sudah digunakan."
        } else {
          message = err?.response?.data?.message || "Gagal membuat user."
        }

        setErrorMsg(message)
        toast.error("Gagal membuat user", {
          description: message,
        })
      } finally {
        setLoading(false)
      }
    },
    [formData, options],
  )

  return {
    formData,
    fieldErrors,
    loading,
    errorMsg,
    successMsg,
    handleInputChange,
    handleSubmit,
  }
}
