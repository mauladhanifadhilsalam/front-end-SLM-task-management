import { z } from "zod";


export const createProjectPhaseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Phase name is required." })
      .min(3, { message: "Phase name must be at least 3 characters." }),

    startDate: z
      .string()
      .min(1, { message: "Start date is required." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid start date format (YYYY-MM-DD)." }),

    endDate: z
      .string()
      .min(1, { message: "End date is required." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid end date format (YYYY-MM-DD)." }),

    projectId: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v > 0, { message: "Project selection is required." }),
  })
  .superRefine((vals, ctx) => {
    if (vals.startDate && vals.endDate) {
      const s = new Date(vals.startDate);
      const e = new Date(vals.endDate);
      const sUTC = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
      const eUTC = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
      if (!(eUTC > sUTC)) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date must be AFTER start date.",
        });
      }
    }
  });
export const editProjectPhaseSchema = createProjectPhaseSchema;
export type CreateProjectPhaseValues = z.infer<typeof createProjectPhaseSchema>;
export type CreateProjectPhaseField = keyof CreateProjectPhaseValues;
