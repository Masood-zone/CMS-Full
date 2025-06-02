import { Request, Response } from "express";
import prisma from "../config/database";

export const expensesController = {
  createExpense: async (req: Request, res: Response) => {
    try {
      const { references, amount, date, submittedBy } = req.body;
      const amountData = parseFloat(amount);
      const expense = await prisma.expense.create({
        data: {
          amount: amountData,
          date: date ? new Date(date) : new Date(),
          description: req.body.description,
          submitedBy: submittedBy, // fixed field name
          reference: {
            connect: {
              id: references?.id,
            },
          },
          submitter: {}, // required for Prisma type
        },
        include: {
          reference: true,
        },
      });
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: `Internal Server Error ${error}` });
    }
  },
  // Reference CRUD for expenses
  getAllReferences: async (req: Request, res: Response) => {
    try {
      const references = await prisma.reference.findMany({
        orderBy: { name: "asc" },
      });
      res.status(200).json(references);
    } catch (error) {
      console.error("Error fetching references:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  createReference: async (req: Request, res: Response) => {
    try {
      const { name, description, isActive } = req.body;
      const reference = await prisma.reference.create({
        data: {
          name,
          description,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
      res.status(201).json(reference);
    } catch (error) {
      console.error("Error creating reference:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  updateReference: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;
      const reference = await prisma.reference.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          isActive,
        },
      });
      res.status(200).json(reference);
    } catch (error) {
      console.error("Error updating reference:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  deleteReference: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.reference.delete({
        where: {
          id: parseInt(id),
        },
      });

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting reference:", error);
      res.status(500).json({ message: `Internal Server Error ${error}` });
    }
  },

  // Get expenses by reference
  getExpensesByReference: async (req: Request, res: Response) => {
    try {
      const { referenceId } = req.params;
      const expenses = await prisma.expense.findMany({
        where: {
          referenceId: parseInt(referenceId),
        },
        include: {
          reference: true,
        },
        orderBy: {
          date: "desc",
        },
      });
      res.status(200).json(expenses);
    } catch (error) {
      console.error("Error fetching expenses by reference:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Expense statistics (example: total, count, by month)
  getExpenseStatistics: async (req: Request, res: Response) => {
    try {
      const total = await prisma.expense.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      });
      res.status(200).json({
        totalAmount: total._sum.amount || 0,
        count: total._count.id || 0,
      });
    } catch (error) {
      console.error("Error fetching expense statistics:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Monthly expense summary (group by month/year)
  getMonthlyExpenseSummary: async (req: Request, res: Response) => {
    try {
      const expenses = await prisma.expense.findMany({
        select: {
          amount: true,
          date: true,
        },
      });
      // Group by month/year
      const summary: Record<string, number> = {};
      expenses.forEach((exp) => {
        const d = new Date(exp.date);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        summary[key] = (summary[key] || 0) + Number(exp.amount);
      });
      res.status(200).json(summary);
    } catch (error) {
      console.error("Error fetching monthly expense summary:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  getAllExpenses: async (req: Request, res: Response) => {
    try {
      const expenses = await prisma.expense.findMany({
        include: {
          reference: true,
        },
        orderBy: {
          date: "desc",
        },
      });

      res.status(200).json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  getExpenseById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const expense = await prisma.expense.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
          reference: true,
        },
      });

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  getReferenceById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const reference = await prisma.reference.findUnique({
        where: {
          id: parseInt(id),
        },
      });

      if (!reference) {
        return res.status(404).json({ message: "Reference not found" });
      }

      res.status(200).json(reference);
    } catch (error) {
      console.error("Error fetching reference:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  updateExpense: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { references, amount, date, submittedBy } = req.body;
      const amountData = parseFloat(amount);
      const expense = await prisma.expense.update({
        where: {
          id: parseInt(id),
        },
        data: {
          amount: amountData,
          date: date ? new Date(date) : new Date(),
          description: req.body.description,
          submitedBy: submittedBy, // fixed field name
          reference: {
            connect: {
              id: references?.id,
            },
          },
          submitter: {}, // required for Prisma type
        },
        include: {
          reference: true,
        },
      });
      res.status(200).json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  deleteExpense: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.expense.delete({
        where: {
          id: parseInt(id),
        },
      });

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
