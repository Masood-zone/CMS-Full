import { z } from "zod"

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().min(10, "Phone number too short").max(15, "Phone number too long").optional(),
    classId: z.string().uuid("Invalid class ID"),
    parentName: z.string().min(1, "Parent name is required").max(100, "Parent name too long"),
    parentPhone: z.string().min(10, "Parent phone too short").max(15, "Parent phone too long"),
    parentEmail: z.string().email("Invalid parent email").optional(),
    address: z.string().max(200, "Address too long").optional(),
    dateOfBirth: z.string().datetime("Invalid date format").optional(),
    isActive: z.boolean().default(true),
  }),
})

export const updateStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name too long").optional(),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name too long").optional(),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z.string().min(10, "Phone number too short").max(15, "Phone number too long").optional().nullable(),
    classId: z.string().uuid("Invalid class ID").optional(),
    parentName: z.string().min(1, "Parent name is required").max(100, "Parent name too long").optional(),
    parentPhone: z.string().min(10, "Parent phone too short").max(15, "Parent phone too long").optional(),
    parentEmail: z.string().email("Invalid parent email").optional().nullable(),
    address: z.string().max(200, "Address too long").optional().nullable(),
    dateOfBirth: z.string().datetime("Invalid date format").optional().nullable(),
    isActive: z.boolean().optional(),
  }),
})

export type CreateStudentRequest = z.infer<typeof createStudentSchema>
export type UpdateStudentRequest = z.infer<typeof updateStudentSchema>
