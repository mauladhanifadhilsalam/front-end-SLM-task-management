import { z } from "zod";

export const issueStatusSchema = z.enum([
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "RESOLVED",
  "CLOSED",
]);

export const issueTypeSchema = z.enum(["TASK", "BUG", "FEATURE", "ISSUE"]);

export const issueAssigneeSchema = z.object({
  id: z.number(),
  assignedAt: z.string(),
  user: z.object({
    id: z.number(),
    fullName: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
});

export const issueSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  status: issueStatusSchema,
  priority: z.string(),
  dueDate: z.string().nullable(),
  projectId: z.number(),
  type: issueTypeSchema,
  assignees: z.array(issueAssigneeSchema),
});

export const issuesResponseSchema = z.array(issueSchema);