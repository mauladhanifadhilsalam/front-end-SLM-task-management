import { z } from "zod"
import type { TeamUpdateStatus } from "@/types/team-update.type"

export const teamUpdateSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, { message: "Project wajib dipilih." })
    .refine((value) => Number(value) > 0, {
      message: "Project wajib dipilih.",
    }),
  yesterdayWork: z
    .string()
    .trim()
    .min(1, { message: "Yesterday work wajib diisi." }),
  todayWork: z
    .string()
    .trim()
    .min(1, { message: "Today work wajib diisi." }),
  blocker: z.string().trim().optional(),
  nextAction: z
    .string()
    .trim()
    .min(1, { message: "Next action wajib diisi." }),
  status: z.enum(["IN_PROGRESS", "NOT_STARTED", "DONE"], {
    required_error: "Status wajib dipilih.",
  }),
})

export type TeamUpdateValues = z.infer<typeof teamUpdateSchema>
export type TeamUpdateField = keyof TeamUpdateValues
export type TeamUpdateStatusOption = TeamUpdateStatus
