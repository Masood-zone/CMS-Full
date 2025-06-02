import { z } from "zod"

export const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Class name is required").max(100, "Class name too long"),
    description: z.string().optional(),
    teacherId: z.string().uuid("Invalid teacher ID").optional(),
    capacity: z.number().int().positive("Capacity must be positive").optional(),
    isActive: z.boolean().default(true),
  }),
})

export const updateClassSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Class name is required").max(100, "Class name too long").optional(),
    description: z.string().optional(),
    teacherId: z.string().uuid("Invalid teacher ID").optional().nullable(),
    capacity: z.number().int().positive("Capacity must be positive").optional(),
    isActive: z.boolean().optional(),
  }),
})

export type CreateClassRequest = z.infer<typeof createClassSchema>
export type UpdateClassRequest = z.infer<typeof updateClassSchema>
