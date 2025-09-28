import { Request, Response } from "express";
import { generateRecordsForNewStudent } from "../../services/record-generation-service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const studentController = {
  // GetAll
  getAll: async (req: Request, res: Response) => {
    try {
      const students = await prisma.student.findMany({
        include: { class: true },
      });
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Error fetching students" });
    }
  },
  getById: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const student = await prisma.student.findUnique({
        where: { id: parseInt(id) },
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          records: true,
        },
      });
      if (student) {
        res.json(student);
      } else {
        res.status(404).json({ error: "Student not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching student" });
    }
  },
  // Get students by class ID
  getClassById: async (req: Request, res: Response) => {
    const { classId } = req.params;
    try {
      const students = await prisma.student.findMany({
        where: { classId: parseInt(classId) },
      });
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Error fetching students by class ID" });
    }
  },

  create: async (req: Request, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      age,
      phone,
      gender,
      classId,
      parentName,
      parentPhone,
      parentEmail,
      address,
      dateOfBirth,
      isActive,
    } = req.body;
    try {
      const newStudent = await prisma.student.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          age: age ? parseInt(age) : undefined,
          gender,
          classId: classId ? parseInt(classId) : undefined,
          parentName,
          parentPhone,
          parentEmail,
          address,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      await generateRecordsForNewStudent(newStudent.id);

      res.status(201).json(newStudent);
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: `Error creating student ${error}` });
    }
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      name,
      email,
      phone,
      age,
      gender,
      classId,
      parentName,
      parentPhone,
      parentEmail,
      address,
      dateOfBirth,
      isActive,
    } = req.body;
    try {
      const updatedStudent = await prisma.student.update({
        where: { id: parseInt(id) },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(name !== undefined && { name }),
          ...(age !== undefined && { age: parseInt(age) }),
          ...(lastName !== undefined && { lastName }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(gender !== undefined && { gender }),
          ...(classId !== undefined && { classId }),
          ...(parentName !== undefined && { parentName }),
          ...(parentPhone !== undefined && { parentPhone }),
          ...(parentEmail !== undefined && { parentEmail }),
          ...(address !== undefined && { address }),
          ...(dateOfBirth !== undefined && {
            dateOfBirth: new Date(dateOfBirth),
          }),
          ...(isActive !== undefined && { isActive }),
        },
      });
      res.json(updatedStudent);
    } catch (error) {
      res.status(400).json({ error: "Error updating student" });
    }
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.student.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Error deleting student" });
    }
  },
};
