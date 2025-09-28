import type { Request, Response } from "express";
import prisma from "../config/database";

export const analyticsController = {
  getAdminAnalytics: async (req: Request, res: Response) => {
    try {
      const [
        totalAdmins,
        totalStudents,
        totalClasses,
        totalCollections,
        totalExpenses,
        totalOwings,
        recentRecords,
        monthlyStats,
      ] = await Promise.all([
        // Total admins
        prisma.user.count({
          where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        }),

        // Total students
        prisma.student.count({
          where: { isActive: true },
        }),

        // Total classes
        prisma.class.count({
          where: { isActive: true },
        }),

        // Total collections this month
        prisma.record.aggregate({
          where: {
            hasPaid: true,
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),

        // Total expenses this month
        prisma.expense.aggregate({
          where: {
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),

        // Total owings
        prisma.owing.aggregate({
          where: { isResolved: false },
          _sum: { amount: true },
        }),

        // Recent records (last 7 days)
        prisma.record.findMany({
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            student: true,
            class: true,
          },
          orderBy: { date: "desc" },
          take: 10,
        }),

        // Monthly statistics for the last 6 months
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', date) as month,
            SUM(CASE WHEN "hasPaid" = true THEN amount ELSE 0 END) as collections,
            COUNT(*) as total_records,
            COUNT(CASE WHEN "hasPaid" = true THEN 1 END) as paid_records
          FROM records 
          WHERE date >= NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', date)
          ORDER BY month DESC
        `,
      ]);

      res.status(200).json({
        overview: {
          totalAdmins: Number(totalAdmins),
          totalStudents: Number(totalStudents),
          totalClasses: Number(totalClasses),
          totalCollections: Number(totalCollections._sum.amount) || 0,
          totalExpenses: Number(totalExpenses._sum.amount) || 0,
          totalOwings: Number(totalOwings._sum.amount) || 0,
        },
        // recentActivity: recentRecords,
        // monthlyStats,
      });
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getTeacherAnalytics: async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    try {
      const dateFilter = {
        ...(startDate &&
          endDate && {
            date: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string),
            },
          }),
      };

      const [
        classInfo,
        totalStudents,
        totalAmount,
        paidAmount,
        unpaidAmount,
        absentCount,
        prepaidAmount,
        owingStudents,
      ] = await Promise.all([
        // Class information
        prisma.class.findUnique({
          where: { id: Number.parseInt(classId) },
          include: { supervisor: true },
        }),

        // Total students in class
        prisma.student.count({
          where: { classId: Number.parseInt(classId), isActive: true },
        }),

        // Total expected amount
        prisma.record.aggregate({
          where: {
            classId: Number.parseInt(classId),
            ...dateFilter,
          },
          _sum: { settingsAmount: true },
        }),

        // Paid amount
        prisma.record.aggregate({
          where: {
            classId: Number.parseInt(classId),
            hasPaid: true,
            ...dateFilter,
          },
          _sum: { amount: true },
        }),

        // Unpaid amount
        prisma.record.aggregate({
          where: {
            classId: Number.parseInt(classId),
            hasPaid: false,
            isAbsent: false,
            ...dateFilter,
          },
          _sum: { settingsAmount: true },
        }),

        // Absent students count
        prisma.record.count({
          where: {
            classId: Number.parseInt(classId),
            isAbsent: true,
            ...dateFilter,
          },
        }),

        // Prepaid amount
        prisma.record.aggregate({
          where: {
            classId: Number.parseInt(classId),
            isPrepaid: true,
            ...dateFilter,
          },
          _sum: { amount: true },
        }),

        // Students with owings
        prisma.owing.findMany({
          where: {
            isResolved: false,
            student: {
              classId: Number.parseInt(classId),
            },
          },
          include: {
            student: true,
          },
        }),
      ]);

      const totalAmountNum = Number(totalAmount._sum.settingsAmount) || 0;
      const paidAmountNum = Number(paidAmount._sum.amount) || 0;
      const unpaidAmountNum = Number(unpaidAmount._sum.settingsAmount) || 0;
      const prepaidAmountNum = Number(prepaidAmount._sum.amount) || 0;
      const collectionRate = totalAmountNum
        ? ((paidAmountNum / totalAmountNum) * 100).toFixed(2)
        : 0;

      res.status(200).json({
        classInfo,
        summary: {
          totalStudents,
          totalAmount: totalAmountNum,
          paidAmount: paidAmountNum,
          unpaidAmount: unpaidAmountNum,
          absentCount,
          prepaidAmount: prepaidAmountNum,
          collectionRate,
        },
        owingStudents,
      });
    } catch (error) {
      console.error("Error fetching teacher analytics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getTeacherByIdAnalytics: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      // 1. Find the teacher
      const teacher = await prisma.user.findUnique({
        where: { id: Number.parseInt(id) },
        select: { id: true, name: true, email: true },
      });
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // 2. Find all classes supervised by this teacher
      const classes = await prisma.class.findMany({
        where: { supervisorId: teacher.id },
        include: { students: true },
      });

      // 3. Get all students in these classes
      const allStudentIds = classes.flatMap((cls) =>
        cls.students.map((stu) => stu.id)
      );
      const students = classes.flatMap((cls) => cls.students);

      // 4. Get all today's records for these students (by payedBy) and classes (by classId)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Fetch all records for today for these students and classes
      const todaysRecords = await prisma.record.findMany({
        where: {
          payedBy: { in: allStudentIds.length > 0 ? allStudentIds : [0] },
          classId: {
            in: classes.length > 0 ? classes.map((cls) => cls.id) : [0],
          },
          date: { gte: todayStart, lte: todayEnd },
        },
        include: { student: true, class: true },
      });

      // 5. Aggregate analytics
      const totalStudents = students.length;
      const totalAmount = todaysRecords.reduce(
        (sum, rec) => sum + Number(rec.amount),
        0
      );
      const paidCount = todaysRecords.filter((rec) => rec.hasPaid).length;
      const unpaidCount = todaysRecords.filter((rec) => !rec.hasPaid).length;

      // 6. Attach records to classes for response
      const classesWithRecords = classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        students: cls.students,
        records: todaysRecords.filter((rec) => rec.classId === cls.id),
      }));

      res.status(200).json({
        teacher,
        classes: classesWithRecords,
        students,
        todaysRecords,
        totalStudents,
        totalAmount,
        paidCount,
        unpaidCount,
      });
    } catch (error) {
      console.error("Error fetching teacher by ID analytics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getOwingsReport: async (req: Request, res: Response) => {
    try {
      const owings = await prisma.owing.findMany({
        where: { isResolved: false },
        include: {
          student: {
            include: {
              class: true,
            },
          },
        },
        orderBy: [{ daysPastDue: "desc" }, { amount: "desc" }],
      });

      const summary = await prisma.owing.aggregate({
        where: { isResolved: false },
        _sum: { amount: true },
        _count: true,
      });

      res.status(200).json({
        owings,
        summary: {
          totalAmount: summary._sum.amount || 0,
          totalCount: summary._count,
        },
      });
    } catch (error) {
      console.error("Error fetching owings report:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // --- ROUTE CONTROLLER STUBS FOR ANALYTICS ---
  getDashboardAnalytics: async (req: Request, res: Response) => {
    // For now, just return admin analytics
    return analyticsController.getAdminAnalytics(req, res);
  },
  getRevenueAnalytics: async (req: Request, res: Response) => {
    // Example: total collections, expenses, net revenue
    try {
      const [collections, expenses] = await Promise.all([
        prisma.record.aggregate({
          where: { hasPaid: true },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
        }),
      ]);
      const totalCollections = Number(collections._sum.amount) || 0;
      const totalExpenses = Number(expenses._sum.amount) || 0;
      res.status(200).json({
        totalCollections,
        totalExpenses,
        netRevenue: totalCollections - totalExpenses,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getStudentAnalytics: async (req: Request, res: Response) => {
    try {
      const total = await prisma.student.count({ where: { isActive: true } });
      const byClass = await prisma.class.findMany({
        include: { _count: { select: { students: true } } },
      });
      res.status(200).json({
        total,
        byClass: byClass.map((c) => ({
          id: c.id,
          name: c.name,
          count: c._count.students,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getClassAnalytics: async (req: Request, res: Response) => {
    try {
      const classes = await prisma.class.findMany({
        include: { _count: { select: { students: true } } },
      });
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getOwingAnalytics: async (req: Request, res: Response) => {
    return analyticsController.getOwingsReport(req, res);
  },
  getPrepaymentAnalytics: async (req: Request, res: Response) => {
    try {
      const total = await prisma.prepayment.count({
        where: { isActive: true },
      });
      const byClass = await prisma.class.findMany({
        include: { _count: { select: { prepayments: true } } },
      });
      res.status(200).json({
        total,
        byClass: byClass.map((c) => ({
          id: c.id,
          name: c.name,
          count: c._count.prepayments,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getExpenseAnalytics: async (req: Request, res: Response) => {
    try {
      const total = await prisma.expense.count();
      const byReference = await prisma.reference.findMany({
        include: { _count: { select: { expenses: true } } },
      });
      res.status(200).json({
        total,
        byReference: byReference.map((r) => ({
          id: r.id,
          name: r.name,
          count: r._count.expenses,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getDailyCollectionReport: async (req: Request, res: Response) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const records = await prisma.record.findMany({
        where: { date: { gte: today } },
        include: { student: true, class: true },
      });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getMonthlyReport: async (req: Request, res: Response) => {
    try {
      const start = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      const records = await prisma.record.findMany({
        where: { date: { gte: start } },
        include: { student: true, class: true },
      });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getYearlyReport: async (req: Request, res: Response) => {
    try {
      const start = new Date(new Date().getFullYear(), 0, 1);
      const records = await prisma.record.findMany({
        where: { date: { gte: start } },
        include: { student: true, class: true },
      });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getCustomDateRangeReport: async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }
    try {
      const records = await prisma.record.findMany({
        where: {
          date: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
        include: { student: true, class: true },
      });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  exportData: async (req: Request, res: Response) => {
    // Placeholder: implement export logic as needed
    res.status(501).json({ error: "Export not implemented" });
  },
};
