import { Prisma } from "@prisma/client";
import prisma from "../src/config/database";

export const generateRecordsForNewStudent = async (studentId: number) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student || !student.class) {
      console.error(
        `Student with id ${studentId} not found or not assigned to a class`
      );
      return;
    }

    const settings = await prisma.settings.findFirst({
      where: { category: "record", key: "amount" },
    });

    const settingsAmount = settings ? parseInt(settings.value) : 0;

    const today = new Date();

    await prisma.record.create({
      data: {
        classId: student.class.id,
        payedBy: student.id,
        date: today,
        amount: 0,
        hasPaid: false,
        isPrepaid: false,
        isAbsent: false,
        settingsAmount,
        submitedBy: student.class.supervisorId || 1,
      },
    });

    console.log(`Record generated for new student ${studentId}`);
  } catch (error) {
    if ((error as Prisma.PrismaClientKnownRequestError).code !== "P2002") {
      console.error(
        `Error generating record for new student ${studentId}:`,
        error
      );
    }
  }
};
