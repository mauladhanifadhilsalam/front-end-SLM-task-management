import { z } from "zod";

export const ticketStatusSchema = z.enum([
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
]);

export const ticketTypeSchema = z.enum(["TASK", "BUG", "FEATURE", "ISSUE"]);

export const assigneeSchema = z.object({
  id: z.number(),
  assignedAt: z.string(),
  user: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
});

export const ticketSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  status: ticketStatusSchema,
  priority: z.string(),
  dueDate: z.string().nullable(),
  projectId: z.number(),
  type: ticketTypeSchema,
  assignees: z.array(assigneeSchema),
});

export const ticketsResponseSchema = z.array(ticketSchema);

export const projectInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
});