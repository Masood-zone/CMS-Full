import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { updateOwingSchema } from "../validations/owing.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { owingController } from "../controllers/owing.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all owings
router.get("/", asyncHandler(owingController.getAllOwings));

// Get owing by ID
router.get("/:id", asyncHandler(owingController.getOwingById));

// Update owing (Admin only)
router.put(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(updateOwingSchema),
  asyncHandler(owingController.updateOwing)
);

// Get owings by student
router.get(
  "/student/:studentId",
  asyncHandler(owingController.getOwingsByStudent)
);

// Get owings by class
router.get("/class/:classId", asyncHandler(owingController.getOwingsByClass));

// Mark owing as paid (Admin only)
router.post(
  "/:id/mark-paid",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(owingController.markOwingAsPaid)
);

// Get owing statistics
router.get("/stats/overview", asyncHandler(owingController.getOwingStatistics));

// Get overdue owings
router.get("/overdue", asyncHandler(owingController.getOverdueOwings));

// Send owing reminders (Admin only)
router.post(
  "/send-reminders",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(owingController.sendOwingReminders)
);

export default router;
