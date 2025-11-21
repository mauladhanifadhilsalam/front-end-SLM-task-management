import { z } from "zod"

// Schema untuk Phase
const phaseSchema = z.object({
  name: z.string().min(1, "Nama fase wajib diisi"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate
    }
    return true
  },
  {
    message: "Tanggal selesai fase harus lebih besar dari tanggal mulai fase",
    path: ["endDate"],
  }
)

// Schema untuk Assignment
const assignmentSchema = z.object({
  userId: z.number().positive("User ID harus dipilih"),
  roleInProject: z.enum(["TECH_LEAD", "BACK_END", "FRONT_END", "DEVOPS", "CLOUD_ENGINEER"]),
})

// Schema untuk Create Project
export const createProjectSchema = z.object({
  name: z.string().min(1, "Nama project wajib diisi").max(255, "Nama project terlalu panjang"),
  categories: z.array(z.string().min(1, "Kategori tidak boleh kosong"))
    .min(1, "Project wajib memiliki minimal satu kategori"),
  ownerId: z.number().positive("Client wajib dipilih"),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("NOT_STARTED"),
  completion: z.number()
    .min(0, "Completion tidak boleh kurang dari 0")
    .max(100, "Completion tidak boleh lebih dari 100")
    .default(0),
  notes: z.string().min(1, "Notes wajib diisi"),
  phases: z.array(phaseSchema).min(1, "Project wajib memiliki minimal satu fase"),
  assignments: z.array(assignmentSchema).optional(),
}).refine(
  (data) => {
    return data.endDate > data.startDate
  },
  {
    message: "Tanggal selesai project harus lebih besar dari tanggal mulai project",
    path: ["endDate"],
  }
).refine(
  (data) => {
    // Validasi bahwa semua fase berada dalam rentang tanggal project
    return data.phases.every((phase) => {
      if (phase.startDate) {
        const phaseStartValid = phase.startDate >= data.startDate && phase.startDate <= data.endDate
        if (!phaseStartValid) return false
      }
      if (phase.endDate) {
        const phaseEndValid = phase.endDate >= data.startDate && phase.endDate <= data.endDate
        if (!phaseEndValid) return false
      }
      return true
    })
  },
  {
    message: "Semua fase harus berada dalam rentang tanggal project",
    path: ["phases"],
  }
)

// Schema untuk Update Project (sama seperti create tapi semua field optional)
export const updateProjectSchema = createProjectSchema.partial()

// Type inference
export type CreateProjectValues = z.infer<typeof createProjectSchema>
export type UpdateProjectValues = z.infer<typeof updateProjectSchema>
export type PhaseValues = z.infer<typeof phaseSchema>
export type AssignmentValues = z.infer<typeof assignmentSchema>