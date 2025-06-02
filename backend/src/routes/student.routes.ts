import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createStudentSchema,
  updateStudentSchema,
} from "../validations/student.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { studentController } from "../controllers/student.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all students (with pagination and filters)
router.get("/", asyncHandler(studentController.getAll));

// Get student by ID
router.get("/:id", asyncHandler(studentController.getById));

// Get students by class ID
router.get("/class/:classId", asyncHandler(studentController.getClassById));

// Create new student
router.post(
  "/create",
  validate(createStudentSchema),
  asyncHandler(studentController.create)
);

// Update student
router.patch(
  "/:id",
  validate(updateStudentSchema),
  asyncHandler(studentController.update)
);

// Delete student (Admin only)
router.delete(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(studentController.delete)
);

export default router;
