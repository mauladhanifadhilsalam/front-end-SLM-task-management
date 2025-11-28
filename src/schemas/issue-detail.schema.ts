import { z } from "zod";

export const issueStatusSchema = z.enum([
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
]);

export const issueAssigneeUserSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export const issueAssigneeSchema = z.object({
  id: z.number(),
  assignedAt: z.string(),
  user: issueAssigneeUserSchema,
});

export const issueDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  status: issueStatusSchema,
  priority: z.string(),
  dueDate: z.string().nullable(),
  projectId: z.number(),
  type: z.literal("ISSUE"),
  assignees: z.array(issueAssigneeSchema),
});