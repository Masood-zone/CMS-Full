import prisma from "../config/database"

export class OwingService {
  async createOwing(data: any) {
    const { studentId, amount, dueDate, notes } = data

    return await prisma.owing.create({
      data: {
        studentId: Number(studentId),
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
    })
  }

  async getAllOwings(filters: { classId?: string; resolved?: string }) {
    const { classId, resolved } = filters

    const whereClause: any = {}

    if (classId) {
      whereClause.student = {
        classId: Number(classId),
      }
    }

    if (resolved !== undefined) {
      whereClause.isResolved = resolved === "true"
    }

    return await prisma.owing.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: [{ isResolved: "asc" }, { daysPastDue: "desc" }, { amount: "desc" }],
    })
  }

  async updateOwing(id: number, data: any) {
    const { amount, dueDate, isResolved, notes } = data

    return await prisma.owing.update({
      where: { id },
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
    })
  }

  async deleteOwing(id: number) {
    await prisma.owing.delete({
      where: { id },
    })
  }

  async updateOwingsDaysPastDue() {
    const owings = await prisma.owing.findMany({
      where: { isResolved: false },
    })

    for (const owing of owings) {
      const daysPastDue = Math.max(
        0,
        Math.floor((new Date().getTime() - owing.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      )

      await prisma.owing.update({
        where: { id: owing.id },
        data: { daysPastDue },
      })
    }

    console.log("Updated days past due for all owings")
  }
}
