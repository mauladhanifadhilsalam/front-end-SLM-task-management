import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/jpg",
  "application/pdf",
  "text/plain",
];

export const fileAttachmentSchema = z.object({
  ticketId: z
    .string()
    .trim()
    .min(1, { message: "Ticket wajib dipilih." }),

  file: z
    .instanceof(File, { message: "File wajib dipilih." })
    .refine((f) => f.size <= MAX_FILE_SIZE, {
      message: "Ukuran file maksimal 5MB.",
    })
    .refine((f) => ALLOWED_TYPES.includes(f.type), {
      message:
        "Tipe file tidak diizinkan. Hanya PNG, JPG, JPEG, WEBP, PDF, atau TXT.",
    }),
});

export type FileAttachmentValues = z.infer<typeof fileAttachmentSchema>;
export type FileAttachmentField = keyof FileAttachmentValues;
