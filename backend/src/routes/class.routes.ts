import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createClassSchema,
  updateClassSchema,
} from "../validations/class.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { classController } from "../controllers/class.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all classes
router.get("/", asyncHandler(classController.getAllClasses));

// Get class by ID
router.get("/:id", asyncHandler(classController.getClassById));

// Create new class (Admin only)
router.post(
  "/",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(createClassSchema),
  asyncHandler(classController.createClass)
);

// Update class (Admin only)
router.put(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(updateClassSchema),
  asyncHandler(classController.updateClass)
);

// Delete class (Admin only)
router.delete(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(classController.deleteClass)
);

// Get students in a class
router.get("/:id/students", asyncHandler(classController.getClassStudents));

// Assign teacher to class (Admin only)
router.post(
  "/:id/assign-teacher",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(classController.assignTeacherToClass)
);

export default router;
