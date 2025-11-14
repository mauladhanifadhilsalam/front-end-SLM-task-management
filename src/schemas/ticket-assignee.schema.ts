import { z } from "zod";

// --- ENUMS ---

// Definisi Role User untuk Assignee
export const AssigneeRoleEnum = z.enum(["ENGINEER", "DEVELOPER", "SUPPORT", "ADMIN"] as const);


// --- UTILITY REFINEMENT FUNCTION ---
// Fungsi utilitas untuk memvalidasi ID: harus angka, terhingga, dan lebih besar dari 0.
// Disarankan juga memastikan ID adalah bilangan bulat (integer)
const numericIdRefinement = (v: number) => Number.isFinite(v) && Number.isInteger(v) && v > 0;
const numericIdMessage = "ID wajib berupa bilangan bulat positif.";


// --- CREATE TICKET ASSIGNEE SCHEMA ---

/**
 * @description Skema validasi untuk membuat penugasan tiket baru.
 * Memastikan ID Ticket dan ID User valid (bilangan bulat positif).
 */
export const createTicketAssigneeSchema = z.object({
  // Ticket ID harus berupa angka positif
  ticketId: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine(numericIdRefinement, { message: "Ticket wajib dipilih dan berupa ID valid." }),

  // User ID (Assignee) harus berupa angka positif
  userId: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine(numericIdRefinement, { message: "Assignee wajib dipilih dan berupa ID valid." }),
    
  // Role opsional, jika Anda ingin menentukan peran assignee
  role: AssigneeRoleEnum.optional(),
});

export type CreateTicketAssigneeValues = z.infer<typeof createTicketAssigneeSchema>;
export type CreateTicketAssigneeField = keyof CreateTicketAssigneeValues;

/** Convert nilai dari schema (valid) ke payload API untuk CREATE */
export function toCreateTicketAssigneePayload(v: CreateTicketAssigneeValues) {
  return {
    ticketId: v.ticketId,
    userId: v.userId,
    role: v.role, // Akan menjadi undefined/null jika opsional dan tidak diisi
  };
}

// --- EDIT TICKET ASSIGNEE SCHEMA ---

/**
 * @description Skema validasi untuk mengedit penugasan tiket yang sudah ada.
 * (Biasanya hanya mengedit role, atau mengganti user)
 */
export const editTicketAssigneeSchema = z.object({
  // ID Penugasan (jika Anda memiliki ID untuk relasi many-to-many)
  id: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine(numericIdRefinement, { message: "ID Penugasan tidak valid." }),
    
  // Ticket ID (Dipertahankan)
  ticketId: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine(numericIdRefinement, { message: "Ticket wajib dipilih dan berupa ID valid." }),

  // User ID baru (Assignee baru)
  userId: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine(numericIdRefinement, { message: "Assignee wajib dipilih dan berupa ID valid." }),
    
  // Role baru opsional
  role: AssigneeRoleEnum.optional(),
});

export type EditTicketAssigneeValues = z.infer<typeof editTicketAssigneeSchema>;
export type EditTicketAssigneeField = keyof EditTicketAssigneeValues;

/** Convert nilai dari schema (valid) ke payload API untuk EDIT */
export function toEditTicketAssigneePayload(v: EditTicketAssigneeValues) {
  return {
    id: v.id,
    ticketId: v.ticketId,
    userId: v.userId,
    role: v.role,
  };
}