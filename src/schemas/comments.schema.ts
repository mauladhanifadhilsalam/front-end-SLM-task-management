import { z } from "zod";


export const createCommentSchema = z.object({
    ticketId: z
        .union([z.string(), z.number()])
        .transform((v) => Number(v))
        .refine((v) => Number.isFinite(v) && v > 0, {
            message: "Ticket ID is required and must be greater than 0.",
        }),
    message: z
        .string()
        .trim()
        .min(1, { message: "Message is required." })
        .min(3, { message: "Message must be at least 3 characters." })
        .max(2000, { message: "Message is too long (max 2000 characters)." }),
});

export type CreateCommentValues = z.infer<typeof createCommentSchema>;
export type CreateCommentField = keyof CreateCommentValues;

export const editCommentSchema = createCommentSchema;
export type EditCommentValues = z.infer<typeof editCommentSchema>;
export type EditCommentField = keyof EditCommentValues;
