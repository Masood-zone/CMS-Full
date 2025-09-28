import { z } from "zod";

export const recordValidation = {
  generateDaily: z.object({
    query: z.object({
      date: z.string(),
      classId: z.string().optional(),
      id: z.string(),
    }),
  }),

  submit: z.object({
    body: z.object({
      classId: z.number(),
      date: z.string(),
      unpaidStudents: z.array(z.any()),
      paidStudents: z.array(z.any()),
      absentStudents: z.array(z.any()),
      submittedBy: z.number(),
      paymentType: z
        .enum(["DAILY", "WEEKLY", "MONTHLY", "TERMLY"])
        .default("DAILY"),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      amount: z.string().optional(),
      payedBy: z.string().optional(),
      isPrepaid: z.boolean().optional(),
      hasPaid: z.boolean().optional(),
      adminId: z.string().optional(),
      classId: z.string().optional(),
      isAbsent: z.boolean().optional(),
      paymentType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "TERMLY"]).optional(),
      notes: z.string().optional(),
    }),
  }),

  updateStatus: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      hasPaid: z.boolean(),
      isAbsent: z.boolean(),
    }),
  }),
};
