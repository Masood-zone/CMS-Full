import { z } from "zod"

export const updateOwingSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive").optional(),
    isPaid: z.boolean().optional(),
    paidAt: z.string().datetime("Invalid payment date format").optional().nullable(),
    notes: z.string().max(200, "Notes too long").optional().nullable(),
  }),
})

export type UpdateOwingRequest = z.infer<typeof updateOwingSchema>
