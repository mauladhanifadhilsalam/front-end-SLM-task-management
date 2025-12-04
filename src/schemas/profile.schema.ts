import { z } from "zod"

const passwordRule = z
  .string()
  .min(8, { message: "Password minimal 8 karakter." })
  .regex(/[0-9]/, { message: "Harus mengandung angka." })
  .regex(/[a-z]/, { message: "Harus mengandung huruf kecil." })
  .regex(/[A-Z]/, { message: "Harus mengandung huruf besar." })
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, {
    message: "Harus mengandung karakter spesial.",
  })

const emptyToUndefined = z
  .string()
  .trim()
  .transform((val) => (val.length === 0 ? undefined : val))

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Nama lengkap wajib diisi." })
    .min(3, { message: "Nama minimal 3 karakter." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Format email tidak valid." }),
  phone: emptyToUndefined.optional(),
  avatarUrl: emptyToUndefined
    .optional()
    .pipe(z.string().url({ message: "Link avatar tidak valid." }).optional()),
  timezone: emptyToUndefined.optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
export type ProfileField = keyof ProfileFormValues

export const changePasswordSchema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: passwordRule,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  })

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type ChangePasswordField = keyof ChangePasswordValues

export const themePreferenceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
})
export type ThemePreferenceValues = z.infer<typeof themePreferenceSchema>

export function toProfileUpdatePayload(values: ProfileFormValues) {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone?.trim(),
    avatarUrl: values.avatarUrl?.trim(),
    timezone: values.timezone?.trim(),
  }
}
