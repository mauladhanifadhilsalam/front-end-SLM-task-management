import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Format email tidak valid." }),
  password: z
    .string()
    .min(1, { message: "Password wajib diisi." })
    .min(8, { message: "Password minimal 8 karakter." }),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type LoginField = keyof LoginValues;
