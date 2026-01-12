import { z } from "zod"

export const projectUpdateSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, { message: "Project wajib dipilih." })
    .refine((value) => Number(value) > 0, {
      message: "Project wajib dipilih.",
    }),
  phaseId: z
    .string()
    .trim()
    .min(1, { message: "Phase wajib dipilih." })
    .refine((value) => Number(value) > 0, {
      message: "Phase wajib dipilih.",
    }),
  reportDate: z
    .string()
    .trim()
    .min(1, { message: "Tanggal laporan wajib diisi." }),
  participant: z
    .string()
    .trim()
    .min(1, { message: "Participant wajib diisi." }),
  objective: z
    .string()
    .trim()
    .min(1, { message: "Objective wajib diisi." }),
  progressHighlight: z
    .string()
    .trim()
    .min(1, { message: "Progress highlight wajib diisi." }),
  teamMood: z
    .string()
    .trim()
    .min(1, { message: "Team mood wajib diisi." }),
})

export type ProjectUpdateValues = z.infer<typeof projectUpdateSchema>
export type ProjectUpdateField = keyof ProjectUpdateValues
