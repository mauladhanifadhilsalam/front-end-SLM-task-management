import { z } from "zod";

export const taskStatusSchema = z.enum([
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
]);

export const taskTypeSchema = z.enum(["TASK", "BUG", "FEATURE", "ISSUE"]);

export const taskAssigneeUserSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export const taskAssigneeSchema = z.object({
  id: z.number(),
  assignedAt: z.string(),
  user: taskAssigneeUserSchema,
});

export const taskDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  priority: z.string(),
  dueDate: z.string().nullable(),
  projectId: z.number(),
  type: taskTypeSchema,
  assignees: z.array(taskAssigneeSchema),
});