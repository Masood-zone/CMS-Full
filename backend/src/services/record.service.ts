import { Prisma } from "@prisma/client";
import prisma from "../config/database";
import { AppError } from "../utils/AppError";

interface GetAllRecordsParams {
  startDate?: string;
  endDate?: string;
  classId?: string;
  paymentType?: string;
  page: number;
  limit: number;
}

interface GetUnpaidStudentsParams {
  date?: string;
  classId?: string;
}

interface GenerateDailyRecordsParams {
  date: string;
  classId?: string;
  adminId: string;
}

export class RecordService {
  async getAllRecords(params: GetAllRecordsParams) {
    const { startDate, endDate, classId, paymentType, page, limit } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (classId) {
      whereClause.classId = Number(classId);
    }

    if (paymentType) {
      whereClause.paymentType = paymentType;
    }

    const [records, total] = await Promise.all([
      prisma.record.findMany({
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
        skip,
        take: limit,
      }),
      prisma.record.count({ where: whereClause }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getOverallRecords() {
    // Fetch all records with student and class info
    const records = await prisma.record.findMany({
      orderBy: {
        date: "desc",
      },
    });

    // Sum up the amount students are to pay (settingsAmount)
    const totalAmount = records.reduce((sum, record) => {
      return sum + Number(record.settingsAmount || 0);
    }, 0);

    return totalAmount;
  }

  async getUnpaidStudents(params: GetUnpaidStudentsParams) {
    const { date, classId } = params;
    const queryDate = date ? new Date(date) : new Date();

    if (isNaN(queryDate.getTime())) {
      throw new AppError("Invalid date provided", 400);
    }

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
        is: {
          isActive: true,
        },
      },
    };

    if (classId) {
      whereClause.classId = Number(classId);
    }

    return await prisma.record.findMany({
      where: whereClause,
      include: {
        student: true,
        class: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async getSubmittedRecordsByDate(date: string) {
    if (!date) {
      throw new AppError("Date is required", 400);
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

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

    // Group records by submitter
    const groupedRecords = records.reduce((acc: any, record) => {
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

    return Object.values(groupedRecords);
  }

  async getRecordDetails(adminId: string) {
    if (!adminId) {
      throw new AppError("Admin ID is required", 400);
    }

    const records = await prisma.record.findMany({
      where: {
        submitedBy: Number(adminId),
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
      throw new AppError("No records found for this admin", 404);
    }

    return records.map((record) => ({
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
  }

  async getStudentRecordsByClassAndDate(classId: number, date: string) {
    if (isNaN(classId) || !date) {
      throw new AppError("Invalid classId or date", 400);
    }

    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      throw new AppError("Invalid date format", 400);
    }

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await prisma.record.findMany({
      where: {
        classId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        student: {
          isNot: null,
        },
      },
      include: {
        student: true,
        class: true,
      },
    });

    return records.filter((record) => record.student !== null);
  }

  async generateDailyRecords(params: GenerateDailyRecordsParams) {
    const { date, classId, adminId } = params;

    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);

    if (isNaN(recordDate.getTime())) {
      throw new AppError("Invalid date provided", 400);
    }

    // Get settings amount
    const settings = await prisma.settings.findUnique({
      where: { key: "canteen_amount" },
    });
    const settingsAmount = settings ? Number.parseFloat(settings.value) : 0;

    // Get classes
    const where: any = { isActive: true };
    if (classId) where.id = Number(classId);

    const classes = await prisma.class.findMany({
      where,
      include: {
        students: {
          where: { isActive: true },
        },
      },
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
                amount: Number(prepayment.amount) / prepayment.numberOfDays,
                hasPaid: true,
                isPrepaid: true,
                isAbsent: false,
                settingsAmount,
                submitedBy: Number(adminId),
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
                submitedBy: Number(adminId),
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
              throw error;
            }
          } else {
            throw error;
          }
        }
      }
    }

    return {
      createdRecords: createdRecords.length,
      skippedRecords,
    };
  }

  async submitRecord(recordData: any) {
    const {
      classId,
      date,
      unpaidStudents,
      paidStudents,
      absentStudents,
      submittedBy,
      paymentType = "DAILY",
    } = recordData;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new AppError("Invalid date", 400);
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Validate class exists
    const classExists = await prisma.class.findUnique({
      where: { id: Number(classId) },
    });
    if (!classExists) {
      throw new AppError("Class not found", 404);
    }

    // Validate admin exists
    const adminExists = await prisma.user.findUnique({
      where: { id: Number(submittedBy) },
    });
    if (!adminExists) {
      throw new AppError("Admin user not found", 404);
    }

    const allStudents = [...unpaidStudents, ...paidStudents, ...absentStudents];
    const payedByIds = allStudents.map((student) => Number(student.paidBy));

    // Validate students exist
    const studentsExist = await prisma.student.findMany({
      where: { id: { in: payedByIds } },
    });
    if (studentsExist.length !== payedByIds.length) {
      throw new AppError("One or more students not found", 404);
    }

    // Fetch active prepayments
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
          (p) => p.studentId === Number(student.paidBy)
        );
        const isPrepaid = !!prepayment;
        const amount = isPrepaid
          ? Number(prepayment!.amount) / prepayment!.numberOfDays
          : student.amount || student.amount_owing;

        return prisma.record.upsert({
          where: {
            payedBy_date: {
              payedBy: Number(student.paidBy),
              date: startOfDay,
            },
          },
          update: {
            amount,
            hasPaid: student.hasPaid || isPrepaid,
            isAbsent: absentStudents.some(
              (s: any) => s.paidBy === student.paidBy
            ),
            submitedBy: Number(submittedBy),
            isPrepaid,
            paymentType,
          },
          create: {
            classId: Number(classId),
            payedBy: Number(student.paidBy),
            date: startOfDay,
            amount,
            hasPaid: student.hasPaid || isPrepaid,
            isAbsent: absentStudents.some(
              (s: any) => s.paidBy === student.paidBy
            ),
            submitedBy: Number(submittedBy),
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
        const existingOwing = await prisma.owing.findFirst({
          where: { studentId: Number(student.paidBy) },
        });
        if (existingOwing) {
          await prisma.owing.update({
            where: { id: existingOwing.id },
            data: {
              amount: {
                increment: student.amount || student.amount_owing,
              },
            },
          });
        } else {
          await prisma.owing.create({
            data: {
              studentId: Number(student.paidBy),
              amount: student.amount || student.amount_owing,
              dueDate: startOfDay,
            },
          });
        }
      }
    }

    return updatedRecords;
  }

  async updateRecord(id: number, updateData: any) {
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
    } = updateData;

    return await prisma.record.update({
      where: { id },
      data: {
        amount: amount ? Number.parseFloat(amount) : undefined,
        payedBy: payedBy ? Number(payedBy) : undefined,
        isPrepaid: isPrepaid !== undefined ? Boolean(isPrepaid) : undefined,
        hasPaid: hasPaid !== undefined ? Boolean(hasPaid) : undefined,
        classId: classId ? Number(classId) : undefined,
        isAbsent: isAbsent !== undefined ? Boolean(isAbsent) : undefined,
        submitedBy: adminId ? Number(adminId) : undefined,
        paymentType: paymentType || undefined,
        notes: notes || undefined,
      },
    });
  }

  async updateStudentStatus(
    id: number,
    statusData: { hasPaid: boolean; isAbsent: boolean }
  ) {
    const { hasPaid, isAbsent } = statusData;

    return await prisma.record.update({
      where: { id },
      data: {
        hasPaid,
        isAbsent,
      },
      include: { student: true },
    });
  }

  async deleteRecord(id: number) {
    await prisma.record.delete({
      where: { id },
    });
  }
}
