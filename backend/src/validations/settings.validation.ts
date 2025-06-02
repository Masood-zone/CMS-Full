import { z } from "zod"

export const updateSettingsSchema = z.object({
  body: z.object({
    canteenAmountPerDay: z.number().positive("Canteen amount must be positive").optional(),
    schoolName: z.string().min(1, "School name is required").max(100, "School name too long").optional(),
    schoolAddress: z.string().max(200, "School address too long").optional(),
    schoolPhone: z.string().max(15, "School phone too long").optional(),
    schoolEmail: z.string().email("Invalid school email").optional(),
    currency: z.string().min(1, "Currency is required").max(10, "Currency too long").optional(),
    timezone: z.string().min(1, "Timezone is required").optional(),
    academicYearStart: z.string().datetime("Invalid academic year start date").optional(),
    academicYearEnd: z.string().datetime("Invalid academic year end date").optional(),
  }),
})

export type UpdateSettingsRequest = z.infer<typeof updateSettingsSchema>
