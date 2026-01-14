import { z } from "zod"
import type { RoleInProject } from "@/types/project-assignment.type"

export const projectAssignmentCreateSchema = z.object({
    projectId: z.string().min(1, "Project wajib dipilih."),
    userId: z.string().min(1, "User wajib dipilih."),
    note: z.string().optional(),
})

export type ProjectAssignmentCreateForm = z.infer<
    typeof projectAssignmentCreateSchema
>
