import { z } from "zod"
import type { RoleInProject } from "@/types/project-assignment.type"

export const projectAssignmentCreateSchema = z.object({
    projectId: z.string().min(1, "Project wajib dipilih."),
    userId: z.string().min(1, "User wajib dipilih."),
    roleInProject: z
        .string()
        .refine((v) => v !== "", { message: "Role wajib dipilih." }) as z.ZodType<RoleInProject>,
    assignedAt: z.string().optional(),
    note: z.string().optional(),
    })

export type ProjectAssignmentCreateForm = z.infer<
    typeof projectAssignmentCreateSchema
>
