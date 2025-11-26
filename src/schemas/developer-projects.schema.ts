import { z } from "zod";

export const assignmentCardSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  name: z.string(),
  roleInProject: z.string(),
  status: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const projectAssignmentSchema = z.object({
  user: z.object({
    id: z.number(),
  }),
  roleInProject: z.string(),
});

export const projectResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assignments: z.array(projectAssignmentSchema),
});

export const decodedTokenSchema = z.object({
  userId: z.number().optional(),
  id: z.number().optional(),
  sub: z.number().optional(),
  user_id: z.number().optional(),
});

export type AssignmentCardSchema = z.infer<typeof assignmentCardSchema>;
export type ProjectResponseSchema = z.infer<typeof projectResponseSchema>;