import { z } from "zod";

export const createPrepaymentSchema = z.object({
  body: z.object({
    studentId: z.number().min(1, "Invalid student ID"),
    amount: z.number().positive("Amount must be positive"),
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format"),
    description: z.string().max(200, "Description too long").optional(),
  }),
});

export const updatePrepaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive").optional(),
    startDate: z.string().datetime("Invalid start date format").optional(),
    endDate: z.string().datetime("Invalid end date format").optional(),
    description: z.string().max(200, "Description too long").optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreatePrepaymentRequest = z.infer<typeof createPrepaymentSchema>;
export type UpdatePrepaymentRequest = z.infer<typeof updatePrepaymentSchema>;
