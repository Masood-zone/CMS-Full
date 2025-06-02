import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

export const owingController = {
  createOwing: async (req: Request, res: Response) => {
    const { studentId, amount, dueDate, notes } = req.body;

    try {
      const owing = await prisma.owing.create({
        data: {
          studentId: Number.parseInt(studentId),
          amount: Number.parseFloat(amount),
          dueDate: new Date(dueDate),
          notes,
        },
        include: {
          student: {
            include: {
              class: true,
            },
          },
        },
      });

      res.status(201).json(owing);
    } catch (error) {
      console.error("Error creating owing:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllOwings: async (req: Request, res: Response) => {
    const { classId, resolved } = req.query;

    try {
      const owings = await prisma.owing.findMany({
        where: {
          ...(classId && {
            student: {
              classId: Number.parseInt(classId as string),
            },
          }),
          ...(resolved !== undefined && {
            isResolved: resolved === "true",
          }),
        },
        include: {
          student: {
            include: {
              class: true,
            },
          },
        },
        orderBy: [
          { isResolved: "asc" },
          { daysPastDue: "desc" },
          { amount: "desc" },
        ],
      });

      res.status(200).json(owings);
    } catch (error) {
      console.error("Error fetching owings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateOwing: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, dueDate, isResolved, notes } = req.body;

    try {
      const owing = await prisma.owing.update({
        where: { id: Number.parseInt(id) },
        data: {
          ...(amount && { amount: Number.parseFloat(amount) }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(isResolved !== undefined && { isResolved }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          student: {
            include: {
              class: true,
            },
          },
        },
      });

      res.status(200).json(owing);
    } catch (error) {
      console.error("Error updating owing:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteOwing: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await prisma.owing.delete({
        where: { id: Number.parseInt(id) },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting owing:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateOwingsDaysPastDue: async () => {
    try {
      const owings = await prisma.owing.findMany({
        where: { isResolved: false },
      });

      for (const owing of owings) {
        const daysPastDue = Math.max(
          0,
          Math.floor(
            (new Date().getTime() - owing.dueDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );

        await prisma.owing.update({
          where: { id: owing.id },
          data: { daysPastDue },
        });
      }

      console.log("Updated days past due for all owings");
    } catch (error) {
      console.error("Error updating owings days past due:", error);
    }
  },

  // Get owing by ID
  getOwingById: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const owing = await prisma.owing.findUnique({
        where: { id: Number.parseInt(id) },
        include: {
          student: { include: { class: true } },
        },
      });
      if (!owing) return res.status(404).json({ error: "Owing not found" });
      res.status(200).json(owing);
    } catch (error) {
      console.error("Error fetching owing by ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get owings by student
  getOwingsByStudent: async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
      const owings = await prisma.owing.findMany({
        where: { studentId: Number.parseInt(studentId) },
        include: {
          student: { include: { class: true } },
        },
        orderBy: [
          { isResolved: "asc" },
          { daysPastDue: "desc" },
          { amount: "desc" },
        ],
      });
      res.status(200).json(owings);
    } catch (error) {
      console.error("Error fetching owings by student:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get owings by class
  getOwingsByClass: async (req: Request, res: Response) => {
    const { classId } = req.params;
    try {
      const owings = await prisma.owing.findMany({
        where: {
          student: { classId: Number.parseInt(classId) },
        },
        include: {
          student: { include: { class: true } },
        },
        orderBy: [
          { isResolved: "asc" },
          { daysPastDue: "desc" },
          { amount: "desc" },
        ],
      });
      res.status(200).json(owings);
    } catch (error) {
      console.error("Error fetching owings by class:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Mark owing as paid
  markOwingAsPaid: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const owing = await prisma.owing.update({
        where: { id: Number.parseInt(id) },
        data: { isResolved: true },
        include: {
          student: { include: { class: true } },
        },
      });
      res.status(200).json(owing);
    } catch (error) {
      console.error("Error marking owing as paid:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get owing statistics (overview)
  getOwingStatistics: async (req: Request, res: Response) => {
    try {
      const totalOwings = await prisma.owing.count();
      const resolvedOwings = await prisma.owing.count({
        where: { isResolved: true },
      });
      const unresolvedOwings = await prisma.owing.count({
        where: { isResolved: false },
      });
      const totalAmountOwed = await prisma.owing.aggregate({
        _sum: { amount: true },
      });
      const totalAmountResolved = await prisma.owing.aggregate({
        _sum: { amount: true },
        where: { isResolved: true },
      });
      const totalAmountUnresolved = await prisma.owing.aggregate({
        _sum: { amount: true },
        where: { isResolved: false },
      });
      res.status(200).json({
        totalOwings,
        resolvedOwings,
        unresolvedOwings,
        totalAmountOwed: totalAmountOwed._sum.amount || 0,
        totalAmountResolved: totalAmountResolved._sum.amount || 0,
        totalAmountUnresolved: totalAmountUnresolved._sum.amount || 0,
      });
    } catch (error) {
      console.error("Error fetching owing statistics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getOverdueOwings: async (_req: Request, res: Response) => {
    try {
      const today = new Date();
      const owings = await prisma.owing.findMany({
        where: {
          isResolved: false,
          dueDate: { lt: today },
        },
        include: {
          student: { include: { class: true } },
        },
        orderBy: [{ daysPastDue: "desc" }, { amount: "desc" }],
      });
      res.status(200).json(owings);
    } catch (error) {
      console.error("Error fetching overdue owings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  sendOwingReminders: async (_req: Request, res: Response) => {
    try {
      // This is a placeholder for sending reminders (e.g., email/SMS integration)
      // For now, just return a success message with a count of unresolved/overdue owings
      const today = new Date();
      const overdueOwings = await prisma.owing.findMany({
        where: {
          isResolved: false,
          dueDate: { lt: today },
        },
        include: {
          student: true,
        },
      });
      // Here you would integrate with a notification service
      res.status(200).json({
        message: `Reminders sent to ${overdueOwings.length} students with overdue owings.`,
        count: overdueOwings.length,
      });
    } catch (error) {
      console.error("Error sending owing reminders:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
