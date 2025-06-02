import { z } from "zod"

export const createExpenseSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    description: z.string().min(1, "Description is required").max(200, "Description too long"),
    referenceId: z.string().uuid("Invalid reference ID"),
    date: z.string().datetime("Invalid date format").optional(),
    receipt: z.string().max(500, "Receipt URL too long").optional(),
  }),
})

export const updateExpenseSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive").optional(),
    description: z.string().min(1, "Description is required").max(200, "Description too long").optional(),
    referenceId: z.string().uuid("Invalid reference ID").optional(),
    date: z.string().datetime("Invalid date format").optional(),
    receipt: z.string().max(500, "Receipt URL too long").optional().nullable(),
  }),
})

export const createExpenseReferenceSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Reference name is required").max(100, "Reference name too long"),
    description: z.string().max(200, "Description too long").optional(),
    isActive: z.boolean().default(true),
  }),
})

export type CreateExpenseRequest = z.infer<typeof createExpenseSchema>
export type UpdateExpenseRequest = z.infer<typeof updateExpenseSchema>
export type CreateExpenseReferenceRequest = z.infer<typeof createExpenseReferenceSchema>
