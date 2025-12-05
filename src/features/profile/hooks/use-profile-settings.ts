"use client"

import * as React from "react"
import { toast } from "sonner"
import { useTheme } from "@/components/theme-provider"
import {
  changePasswordSchema,
  profileSchema,
  themePreferenceSchema,
  toProfileUpdatePayload,
  type ChangePasswordField,
  type ChangePasswordValues,
  type ProfileField,
  type ProfileFormValues,
  type ThemePreferenceValues,
} from "@/schemas/profile.schema"
import {
  changeMyPassword,
  fetchMyProfile,
  updateMyProfile,
} from "@/services/profile.service"
import type { UserProfile } from "@/types/user.types"

type ProfileFieldErrors = Partial<Record<ProfileField, string>>
type PasswordFieldErrors = Partial<Record<ChangePasswordField, string>>

const defaultProfileForm: ProfileFormValues = {
  fullName: "",
  email: "",
  phone: "",
  avatarUrl: "",
  timezone: "",
}

const defaultPasswordForm: ChangePasswordValues = {
  newPassword: "",
  confirmPassword: "",
}

export function useProfileSettings() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] =
    React.useState<ProfileFormValues>(defaultProfileForm)
  const [passwordForm, setPasswordForm] =
    React.useState<ChangePasswordValues>(defaultPasswordForm)

  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [changingPassword, setChangingPassword] = React.useState(false)

  const [profileErrors, setProfileErrors] =
    React.useState<ProfileFieldErrors>({})
  const [passwordErrors, setPasswordErrors] =
    React.useState<PasswordFieldErrors>({})
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const { theme, setTheme } = useTheme()

  const loadProfile = React.useCallback(async () => {
    setLoadingProfile(true)
    setErrorMessage(null)
    try {
      const data = await fetchMyProfile()
      setProfile(data)
      setProfileForm({
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        avatarUrl: data.avatarUrl ?? "",
        timezone: data.timezone ?? "",
      })
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Gagal memuat profil."
      setErrorMessage(msg)
      toast.error("Gagal memuat profil", { description: msg })
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  React.useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const validateProfileField = React.useCallback(
    (field: ProfileField, value: string) => {
      const singleSchema = (profileSchema as any).pick({ [field]: true })
      const result = singleSchema.safeParse({ [field]: value })
      setProfileErrors((prev) => ({
        ...prev,
        [field]: result.success ? undefined : result.error.issues[0]?.message,
      }))
    },
    [],
  )

  const validatePasswordField = React.useCallback(
    (field: ChangePasswordField, value: string) => {
    const singleSchema = (changePasswordSchema as any).pick({ [field]: true })
    const result = singleSchema.safeParse({ [field]: value })
    setPasswordErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }))
    },
    [],
  )

  const handleProfileChange = React.useCallback(
    (field: ProfileField, value: string) => {
      setProfileForm((prev) => ({ ...prev, [field]: value }))
      if (profileErrors[field]) validateProfileField(field, value)
    },
    [profileErrors, validateProfileField],
  )

  const handlePasswordChange = React.useCallback(
    (field: ChangePasswordField, value: string) => {
      setPasswordForm((prev) => ({ ...prev, [field]: value }))
      validatePasswordField(field, value)
    },
    [validatePasswordField],
  )

  const handlePasswordBlur = React.useCallback(
    (field: ChangePasswordField) => {
      validatePasswordField(field, passwordForm[field] ?? "")
    },
    [passwordForm, validatePasswordField],
  )

  const submitProfile = React.useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      if (!profile?.id) {
        setErrorMessage("ID profil tidak ditemukan.")
        return
      }

      const parsed = profileSchema.safeParse(profileForm)
      if (!parsed.success) {
        const nextErrors: ProfileFieldErrors = {}
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as ProfileField
          if (!nextErrors[key]) nextErrors[key] = issue.message
        }
        setProfileErrors(nextErrors)
        return
      }

      setSavingProfile(true)
      setErrorMessage(null)
      try {
        const payload = toProfileUpdatePayload(parsed.data)
        const updated = await updateMyProfile(profile.id, payload)
        setProfile(updated)
        setProfileForm({
          fullName: updated.fullName ?? parsed.data.fullName,
          email: updated.email ?? parsed.data.email,
          phone: updated.phone ?? parsed.data.phone ?? "",
          avatarUrl: updated.avatarUrl ?? parsed.data.avatarUrl ?? "",
          timezone: updated.timezone ?? parsed.data.timezone ?? "",
        })

        toast.success("Profil diperbarui", {
          description: "Perubahan profil kamu sudah disimpan.",
        })
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal menyimpan perubahan profil."
        setErrorMessage(msg)
        toast.error("Gagal menyimpan profil", { description: msg })
      } finally {
        setSavingProfile(false)
      }
    },
    [profile?.id, profileForm],
  )

  const submitPassword = React.useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const parsed = changePasswordSchema.safeParse(passwordForm)
      if (!parsed.success) {
        const nextErrors: PasswordFieldErrors = {}
        for (const issue of parsed.error.issues) {
              const key = issue.path[0] as ChangePasswordField
              if (!nextErrors[key]) nextErrors[key] = issue.message
        }
        setPasswordErrors(nextErrors)
        return
      }

      setChangingPassword(true)
      setErrorMessage(null)
      try {
        await changeMyPassword(parsed.data)
        setPasswordForm(defaultPasswordForm)
        toast.success("Password diganti", {
          description: "Password baru telah aktif.",
        })
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Gagal mengganti password."
        setErrorMessage(msg)
        toast.error("Gagal mengganti password", { description: msg })
      } finally {
        setChangingPassword(false)
      }
    },
    [passwordForm],
  )

  const applyThemePreference = React.useCallback(
    (values: ThemePreferenceValues) => {
      const parsed = themePreferenceSchema.safeParse(values)
      if (!parsed.success) return
      setTheme(parsed.data.theme)
    },
    [setTheme],
  )

  return {
    profile,
    profileForm,
    profileErrors,
    passwordForm,
    passwordErrors,
    loadingProfile,
    savingProfile,
    changingPassword,
    errorMessage,
    theme,
    loadProfile,
    handleProfileChange,
    handlePasswordChange,
    handlePasswordBlur,
    submitProfile,
    submitPassword,
    applyThemePreference,
  }
}
