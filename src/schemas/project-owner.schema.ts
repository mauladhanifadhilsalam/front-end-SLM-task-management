import { z } from "zod";

export const projectOwnerSchema = z.object({
  name: z.string().trim().min(1, { message: "Nama wajib diisi." }),
  company: z.string().trim().min(1, { message: "Company wajib diisi." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Format email tidak valid." }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Phone wajib diisi." })
    .regex(/^\+?\d+$/, {
      message: "Nomor telepon hanya boleh berisi angka, dan boleh diawali dengan '+'.",
    })
    .min(10, { message: "Nomor telepon minimal 10 digit." })
    .max(14, { message: "Nomor telepon maksimal 13 digit." }),
  address: z.string().trim().min(1, { message: "Address wajib diisi." }),
});

export type ProjectOwnerValues = z.infer<typeof projectOwnerSchema>;
export type ProjectOwnerField = keyof ProjectOwnerValues;
