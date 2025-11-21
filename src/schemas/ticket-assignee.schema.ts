import { z } from "zod";

// Schema untuk validasi form Create Ticket Assignee
export const createTicketAssigneeSchema = z.object({
  projectId: z
    .union([z.number(), z.undefined()])
    .refine((val) => val !== undefined, {
      message: "Project wajib dipilih",
    })
    .transform((val) => val as number)
    .pipe(
      z
        .number()
        .int({ message: "Project ID harus berupa bilangan bulat" })
        .positive({ message: "Project ID harus bernilai positif" })
    ),

  ticketId: z
    .union([z.number(), z.undefined()])
    .refine((val) => val !== undefined, {
      message: "Ticket wajib dipilih",
    })
    .transform((val) => val as number)
    .pipe(
      z
        .number()
        .int({ message: "Ticket ID harus berupa bilangan bulat" })
        .positive({ message: "Ticket ID harus bernilai positif" })
    ),

  userIds: z
    .array(
      z
        .number()
        .int({ message: "User ID harus berupa bilangan bulat" })
        .positive({ message: "User ID harus bernilai positif" })
    )
    .min(1, { message: "Minimal satu assignee harus dipilih" }),
});

// Type inference untuk TypeScript
export type CreateTicketAssigneeInput = z.infer<typeof createTicketAssigneeSchema>;

// Schema untuk validasi individual assignment (saat post ke API)
export const ticketAssignmentSchema = z.object({
  ticketId: z
    .number()
    .int({ message: "Ticket ID harus berupa bilangan bulat" })
    .positive({ message: "Ticket ID harus bernilai positif" }),

  userId: z
    .number()
    .int({ message: "User ID harus berupa bilangan bulat" })
    .positive({ message: "User ID harus bernilai positif" }),
});

export type TicketAssignmentInput = z.infer<typeof ticketAssignmentSchema>;

// Schema untuk response data
export const userSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(1, { message: "Nama lengkap tidak boleh kosong" }),
  email: z.string().email({ message: "Format email tidak valid" }),
});

export const projectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, { message: "Nama project tidak boleh kosong" }),
  description: z.string().optional(),
});

export const ticketAssigneeSchema = z.object({
  id: z.number().int().positive(),
  user: userSchema,
});

export const ticketSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, { message: "Judul ticket tidak boleh kosong" }),
  projectId: z.number().int().positive(),
  assignees: z.array(ticketAssigneeSchema).default([]),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Ticket = z.infer<typeof ticketSchema>;
export type TicketAssignee = z.infer<typeof ticketAssigneeSchema>;