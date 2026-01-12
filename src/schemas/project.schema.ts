import { z } from "zod"

const isoDate = z
  .string()
  .min(1, "Tanggal wajib diisi")
  .refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "Format tanggal tidak valid",
  )

// Phase
const phaseSchema = z
  .object({
    name: z.string().min(1, "Nama fase wajib diisi"),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end > start
      }
      return true
    },
    {
      message:
        "Tanggal selesai fase harus lebih besar dari tanggal mulai fase",
      path: ["endDate"],
    },
  )

// Assignment
const assignmentSchema = z.object({
  userId: z.number().positive("User ID harus dipilih"),
})

// Create Project
export const createProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama project wajib diisi")
      .max(255, "Nama project terlalu panjang"),
    categories: z
      .array(z.string().min(1, "Kategori tidak boleh kosong"))
      .min(1, "Project wajib memiliki minimal satu kategori"),
    ownerId: z.number().positive("Client wajib dipilih"),

    // ⬇️ sekarang string ISO, bukan Date
    startDate: isoDate,
    endDate: isoDate,

    status: z
      .enum(["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "DONE"])
      .default("NOT_STARTED"),
    completion: z
      .number()
      .min(0, "Completion tidak boleh kurang dari 0")
      .max(100, "Completion tidak boleh lebih dari 100")
      .default(0),
    notes: z.string().min(1, "Notes wajib diisi"),
    phases: z
      .array(phaseSchema)
      .min(1, "Project wajib memiliki minimal satu fase"),
    assignments: z.array(assignmentSchema).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end > start
    },
    {
      message:
        "Tanggal selesai project harus lebih besar dari tanggal mulai project",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      const projectStart = new Date(data.startDate)
      const projectEnd = new Date(data.endDate)

      return data.phases.every((phase) => {
        if (phase.startDate) {
          const s = new Date(phase.startDate)
          const valid =
            s >= projectStart && s <= projectEnd
          if (!valid) return false
        }
        if (phase.endDate) {
          const e = new Date(phase.endDate)
          const valid =
            e >= projectStart && e <= projectEnd
          if (!valid) return false
        }
        return true
      })
    },
    {
      message:
        "Semua fase harus berada dalam rentang tanggal project",
      path: ["phases"],
    },
  )

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectValues = z.infer<typeof createProjectSchema>
export type UpdateProjectValues = z.infer<typeof updateProjectSchema>
export type PhaseValues = z.infer<typeof phaseSchema>
export type AssignmentValues = z.infer<typeof assignmentSchema>
