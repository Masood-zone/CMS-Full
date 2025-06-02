import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    phone: z
      .string()
      .min(7, "Phone number too short")
      .max(20, "Phone number too long")
      .optional(),
    role: z.enum(["ADMIN", "TEACHER", "SUPER_ADMIN"]),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name too long")
      .optional(),
    phone: z
      .string()
      .min(7, "Phone number too short")
      .max(20, "Phone number too long")
      .optional(),
    role: z.enum(["ADMIN", "TEACHER", "SUPER_ADMIN"]).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  }),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
