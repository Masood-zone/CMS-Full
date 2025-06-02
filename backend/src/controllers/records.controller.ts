import { Prisma, PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

import prisma from "../config/database";

interface GroupedRecords {
  [adminId: number]: {
    admin: {
      id: number;
      name: string | null;
      email: string;
    };
    records: any[];
  };
}

export const recordController = {
  generateDailyRecords: async (req: Request, res: Response) => {
    const { date, classId, id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Admin ID is required",
      });
    }

    const recordDate = new Date(date as string);
    recordDate.setHours(0, 0, 0, 0);

    if (isNaN(recordDate.getTime())) {
      return res.status(400).json({ error: "Invalid date provided " + date });
    }

    try {
      const settings = await prisma.settings.findUnique({
        where: { key: "canteen_daily_amount" },
      });
      const settingsAmount = settings ? Number.parseFloat(settings.value) : 0;

      const classQuery = classId
        ? { where: { id: Number.parseInt(classId as string), isActive: true } }
        : { where: { isActive: true } };

      const classes = await prisma.class.findMany({
        include: {
          students: {
            where: { isActive: true },
          },
        },
        ...classQuery,
      });

      const createdRecords = [];
      const skippedRecords = [];

      // Fetch active prepayments for the given date
      const activePrepayments = await prisma.prepayment.findMany({
        where: {
          startDate: { lte: recordDate },
          endDate: { gte: recordDate },
          isActive: true,
        },
        include: { student: true },
      });

      for (const classItem of classes) {
        for (const student of classItem.students) {
          try {
            const prepayment = activePrepayments.find(
              (p) => p.studentId === student.id
            );

            if (prepayment) {
              // Create a prepaid record
              const record = await prisma.record.create({
                data: {
                  classId: classItem.id,
                  payedBy: student.id,
                  date: recordDate,
                  amount: prepayment.amount / prepayment.numberOfDays,
                  hasPaid: true,
                  isPrepaid: true,
                  isAbsent: false,
                  settingsAmount,
                  submitedBy: Number.parseInt(id as string),
                },
              });
              createdRecords.push(record);
            } else {
              // Create a regular record
              const record = await prisma.record.create({
                data: {
                  classId: classItem.id,
                  payedBy: student.id,
                  date: recordDate,
                  amount: settingsAmount,
                  hasPaid: false,
                  isPrepaid: false,
                  isAbsent: false,
                  settingsAmount,
                  submitedBy: Number.parseInt(id as string),
                },
              });
              createdRecords.push(record);
            }
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
              if (error.code === "P2002") {
                skippedRecords.push({
                  studentId: student.id,
                  date: recordDate.toISOString(),
                });
              } else {
                console.error("Prisma error:", error);
                throw error;
              }
            } else {
              console.error("Unknown error:", error);
              throw error;
            }
          }
        }
      }

      res.status(200).json({
        message: "Daily records generated successfully",
        createdRecords: createdRecords.length,
        skippedRecords: skippedRecords,
      });
    } catch (error) {
      console.error("Error generating daily records:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllRecords: async (req: Request, res: Response) => {
    const { startDate, endDate, classId, paymentType } = req.query;

    try {
      const whereClause: any = {};

      if (startDate && endDate) {
        whereClause.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      if (classId) {
        whereClause.classId = Number.parseInt(classId as string);
      }

      if (paymentType) {
        whereClause.paymentType = paymentType;
      }

      const records = await prisma.record.findMany({
        where: whereClause,
        include: {
          student: true,
          class: true,
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: "desc" },
      });

      res.status(200).json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getSubmittedRecordsByDate: async (req: Request, res: Response) => {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Invalid date provided" });
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    try {
      const records = await prisma.record.findMany({
        where: {
          date: {
            gte: queryDate,
            lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          class: true,
          student: true,
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      const groupedRecords = records.reduce<GroupedRecords>((acc, record) => {
        const adminId = record.submitedBy;
        if (!acc[adminId]) {
          acc[adminId] = {
            admin: record.submitter,
            records: [],
          };
        }
        acc[adminId].records.push(record);
        return acc;
      }, {});

      res.status(200).json(Object.values(groupedRecords));
    } catch (error) {
      console.error("Error fetching submitted records:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getRecordDetails: async (req: Request, res: Response) => {
    const { id } = req.query;
    const adminId = id as string;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const records = await prisma.record.findMany({
        where: {
          submitedBy: Number.parseInt(adminId),
          student: {
            isNot: null,
          },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      if (records.length === 0) {
        return res
          .status(404)
          .json({ error: "No records found for this admin" });
      }

      const formattedRecords = records.map((record) => ({
        id: record.id,
        date: record.date.toISOString(),
        student: record.student,
        class: record.class,
        amount: record.amount,
        hasPaid: record.hasPaid,
        isAbsent: record.isAbsent,
        isPrepaid: record.isPrepaid,
        paymentType: record.paymentType,
      }));

      res.status(200).json(formattedRecords);
    } catch (error) {
      console.error("Error fetching record details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getStudentRecordsByClassAndDate: async (req: Request, res: Response) => {
    const classId = Number.parseInt(req.params.classId);
    const date = new Date(req.query.date as string);

    if (isNaN(classId) || isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid classId or date" });
    }

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const records = await prisma.record.findMany({
        where: {
          classId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          payedBy: {
            not: null,
          },
        },
        include: {
          student: true,
          class: true,
        },
      });

      const filteredRecords = records.filter(
        (record) => record.student !== null
      );
      res.status(200).json(filteredRecords);
    } catch (error) {
      console.error("Error fetching student records:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  submitAdminRecord: async (req: Request, res: Response) => {
    const {
      classId,
      date,
      unpaidStudents,
      paidStudents,
      absentStudents,
      submittedBy,
      paymentType = "DAILY",
    } = req.body;

    const id = submittedBy ? Number.parseInt(submittedBy as string) : 0;

    if (
      !classId ||
      !date ||
      !Array.isArray(unpaidStudents) ||
      !Array.isArray(paidStudents) ||
      !Array.isArray(absentStudents)
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    try {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);

      // Validate classId exists
      const classExists = await prisma.class.findUnique({
        where: { id: Number.parseInt(classId) },
      });
      if (!classExists) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Validate adminId (submitedBy) exists
      const adminExists = await prisma.user.findUnique({ where: { id } });
      if (!adminExists) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      // Validate all payedBy IDs exist in Student table
      const allStudents = [
        ...unpaidStudents,
        ...paidStudents,
        ...absentStudents,
      ];
      const payedByIds = allStudents.map((student) =>
        Number.parseInt(student.paidBy)
      );
      const studentsExist = await prisma.student.findMany({
        where: { id: { in: payedByIds } },
      });
      if (studentsExist.length !== payedByIds.length) {
        return res
          .status(404)
          .json({ error: "One or more students not found" });
      }

      // Fetch active prepayments for the given date
      const activePrepayments = await prisma.prepayment.findMany({
        where: {
          startDate: { lte: startOfDay },
          endDate: { gte: startOfDay },
          studentId: { in: payedByIds },
          isActive: true,
        },
      });

      // Perform upsert for records
      const updatedRecords = await prisma.$transaction(
        allStudents.map((student) => {
          const prepayment = activePrepayments.find(
            (p) => p.studentId === Number.parseInt(student.paidBy)
          );
          const isPrepaid = !!prepayment;
          const amount = isPrepaid
            ? prepayment!.amount / prepayment!.numberOfDays
            : student.amount || student.amount_owing;

          return prisma.record.upsert({
            where: {
              payedBy_date: {
                payedBy: Number.parseInt(student.paidBy),
                date: startOfDay,
              },
            },
            update: {
              amount,
              hasPaid: student.hasPaid || isPrepaid,
              isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
              submitedBy: id,
              isPrepaid,
              paymentType,
            },
            create: {
              classId: Number.parseInt(classId),
              payedBy: Number.parseInt(student.paidBy),
              date: startOfDay,
              amount,
              hasPaid: student.hasPaid || isPrepaid,
              isAbsent: absentStudents.some((s) => s.paidBy === student.paidBy),
              submitedBy: id,
              settingsAmount: student.amount || student.amount_owing,
              isPrepaid,
              paymentType,
            },
          });
        })
      );

      // Create owings for unpaid students
      for (const student of unpaidStudents) {
        if (!student.hasPaid) {
          await prisma.owing.upsert({
            where: {
              studentId: Number.parseInt(student.paidBy),
            },
            update: {
              amount: {
                increment: student.amount || student.amount_owing,
              },
            },
            create: {
              studentId: Number.parseInt(student.paidBy),
              amount: student.amount || student.amount_owing,
              dueDate: startOfDay,
            },
          });
        }
      }

      res.status(201).json(updatedRecords);
    } catch (error) {
      console.error("Error submitting admin record:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getUnpaidStudents: async (req: Request, res: Response) => {
    const { date, classId } = req.query;
    const queryDate = date ? new Date(date as string) : new Date();

    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ error: "Invalid date provided" });
    }

    try {
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);

      const whereClause: any = {
        hasPaid: false,
        isAbsent: false,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        student: {
          isNot: null,
          isActive: true,
        },
      };

      if (classId) {
        whereClause.classId = Number.parseInt(classId as string);
      }

      const unpaidStudents = await prisma.record.findMany({
        where: whereClause,
        include: {
          student: true,
          class: true,
        },
        orderBy: {
          date: "desc",
        },
      });

      res.status(200).json(unpaidStudents);
    } catch (error) {
      console.error("Error fetching unpaid students:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateStudentStatus: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hasPaid, isAbsent } = req.body;

    if (typeof hasPaid !== "boolean" || typeof isAbsent !== "boolean") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    try {
      const updatedRecord = await prisma.record.update({
        where: { id: Number.parseInt(id) },
        data: {
          hasPaid,
          isAbsent,
        },
        include: { student: true },
      });

      res.status(200).json(updatedRecord);
    } catch (error) {
      console.error("Error updating student status:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({ error: "Record not found" });
        } else {
          res.status(400).json({ error: "Error updating record" });
        }
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      amount,
      payedBy,
      isPrepaid,
      hasPaid,
      adminId,
      classId,
      isAbsent,
      paymentType,
      notes,
    } = req.body;

    try {
      const updatedRecord = await prisma.record.update({
        where: { id: Number.parseInt(id) },
        data: {
          amount: amount ? Number.parseFloat(amount) : undefined,
          payedBy: payedBy ? Number.parseInt(payedBy) : undefined,
          isPrepaid: isPrepaid !== undefined ? Boolean(isPrepaid) : undefined,
          hasPaid: hasPaid !== undefined ? Boolean(hasPaid) : undefined,
          classId: classId ? Number.parseInt(classId) : undefined,
          isAbsent: isAbsent !== undefined ? Boolean(isAbsent) : undefined,
          submitedBy: adminId ? Number.parseInt(adminId) : undefined,
          paymentType: paymentType || undefined,
          notes: notes || undefined,
        },
      });
      res.json(updatedRecord);
    } catch (error) {
      console.error("Error updating record:", error);
      res.status(400).json({ error: "Error updating record" });
    }
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.record.delete({
        where: { id: Number.parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting record:", error);
      res.status(400).json({ error: "Error deleting record" });
    }
  },
};
