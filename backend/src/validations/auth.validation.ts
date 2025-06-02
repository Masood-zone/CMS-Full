import { z } from "zod"

export const authValidation = {
  login: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    }),
  }),

  signup: z.object({
    body: z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      name: z.string().min(1, "Name is required"),
      phone: z.string().optional(),
      role: z.enum(["ADMIN", "TEACHER", "SUPER_ADMIN"]).default("TEACHER"),
      gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    }),
  }),
}
