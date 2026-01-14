import { z } from "zod";


export const RoleEnum = z.enum(["PROJECT_MANAGER", "DEVELOPER"] as const);
export type Role = z.infer<typeof RoleEnum>;


export const createUserSchema = z.object({
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

  role: RoleEnum,

  password: z
    .string()
    .min(8, { message: "Password minimal 8 karakter." })
    .regex(/[0-9]/, { message: "Harus mengandung angka (0–9)." })
    .regex(/[a-z]/, { message: "Harus mengandung huruf kecil (a–z)." })
    .regex(/[A-Z]/, { message: "Harus mengandung huruf besar (A–Z)." })
    .regex(
      /[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/,
      { message: "Harus mengandung karakter spesial." }
    ),

  projectRole: z.string().optional(),
});
export type CreateUserValues = z.infer<typeof createUserSchema>;
export type CreateUserField = keyof CreateUserValues;


export const editUserSchema = z.object({
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

  role: RoleEnum,

  password: z.union([
    z.literal(""), 
    z
      .string()
      .min(8, { message: "Password minimal 8 karakter." })
      .regex(/[0-9]/, { message: "Harus mengandung angka (0–9)." })
      .regex(/[a-z]/, { message: "Harus mengandung huruf kecil (a–z)." })
      .regex(/[A-Z]/, { message: "Harus mengandung huruf besar (A–Z)." })
      .regex(
        /[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/,
        { message: "Harus mengandung karakter spesial." }
      ),
  ]).optional(),

  projectRole: z.string().optional(),
});
export type EditUserValues = z.infer<typeof editUserSchema>;
export type EditUserField = keyof EditUserValues;


export function toEditPayload(data: EditUserValues) {
  const base: Record<string, unknown> = {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    role: data.role,
  };
  if (data.password && data.password.length > 0) {
    base.password = data.password;
  }
  if (data.projectRole) {
    base.projectRole = data.projectRole;
  }
  return base;
}
