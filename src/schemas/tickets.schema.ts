import { z } from "zod";

export const TicketTypeEnum = z.enum(["ISSUE", "TASK"] as const);
export const TicketPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const);
export const TicketStatusEnum = z.enum([
  "NEW",
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
] as const);


const dtLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const createTicketSchema = z
  .object({
    projectId: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v > 0, { message: "Project wajib dipilih." }),

    requesterId: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v > 0, { message: "Requester wajib dipilih." }),

    type: TicketTypeEnum,
    title: z.string().trim().min(3, { message: "Title minimal 3 karakter." }),

    description: z.string().trim().min(10, { message: "Description minimal 10 karakter." }),

    // ← TAMBAHAN BARU
    actionPlan: z.string().trim().optional(),

    priority: TicketPriorityEnum,
    status: TicketStatusEnum,


    startDate: z
      .string()
      .min(1, { message: "Start Date wajib diisi." })
      .regex(dtLocalRegex, { message: "Format Start Date tidak valid." }),

    dueDate: z
      .string()
      .min(1, { message: "Due Date wajib diisi." })
      .regex(dtLocalRegex, { message: "Format Due Date tidak valid." }),
  })
  .superRefine((vals, ctx) => {

    const s = new Date(vals.startDate).getTime();
    const d = new Date(vals.dueDate).getTime();
    if (!Number.isNaN(s) && !Number.isNaN(d) && d < s) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Due Date tidak boleh lebih awal dari Start Date.",
      });
    }
  });

export type CreateTicketValues = z.infer<typeof createTicketSchema>;
export type CreateTicketField = keyof CreateTicketValues;

export function toCreateTicketPayload(v: CreateTicketValues) {
  return {
    projectId: v.projectId,
    requesterId: v.requesterId,
    type: v.type,
    title: v.title.trim(),
    description: v.description.trim(),
    actionPlan: v.actionPlan?.trim() || null, // ← TAMBAHAN BARU
    priority: v.priority,
    status: v.status,
    startDate: new Date(v.startDate).toISOString(),
    dueDate: new Date(v.dueDate).toISOString(),
  };
}

export const editTicketSchema = z
  .object({
    projectId: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v > 0, { message: "Project wajib dipilih." }),

    requesterId: z
      .union([z.string(), z.number()])
      .transform((v) => Number(v))
      .refine((v) => Number.isFinite(v) && v > 0, { message: "Requester wajib dipilih." }),

    type: TicketTypeEnum,
    title: z.string().trim().min(3, { message: "Title minimal 3 karakter." }),
    description: z.string().trim().min(10, { message: "Description minimal 10 karakter." }),
    
    // ← TAMBAHAN BARU
    actionPlan: z.string().trim().optional(),
    
    priority: TicketPriorityEnum,
    status: TicketStatusEnum,

    startDate: z
      .string()
      .min(1, { message: "Start Date wajib diisi." })
      .regex(dtLocalRegex, { message: "Format Start Date tidak valid." }),

    dueDate: z
      .string()
      .min(1, { message: "Due Date wajib diisi." })
      .regex(dtLocalRegex, { message: "Format Due Date tidak valid." }),
  })
  .superRefine((vals, ctx) => {
    const s = new Date(vals.startDate).getTime();
    const d = new Date(vals.dueDate).getTime();
    if (!Number.isNaN(s) && !Number.isNaN(d) && d < s) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Due Date tidak boleh lebih awal dari Start Date.",
      });
    }
  });

export type EditTicketValues = z.infer<typeof editTicketSchema>;
export type EditTicketField = keyof EditTicketValues;

/** Convert nilai dari schema (valid) ke payload API */
export function toEditTicketPayload(v: EditTicketValues) {
  return {
    projectId: v.projectId,
    requesterId: v.requesterId,
    type: v.type,
    title: v.title.trim(),
    description: v.description.trim(),
    actionPlan: v.actionPlan?.trim() || null, // ← TAMBAHAN BARU
    priority: v.priority,
    status: v.status,
    startDate: new Date(v.startDate).toISOString(),
    dueDate: new Date(v.dueDate).toISOString(),
  };
}