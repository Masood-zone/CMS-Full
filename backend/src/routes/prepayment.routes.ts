import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createPrepaymentSchema,
  updatePrepaymentSchema,
} from "../validations/prepayment.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { prepaymentController } from "../controllers/prepayment.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all prepayments
router.get("/", asyncHandler(prepaymentController.getAllPrepayments));

// Get all prepayments by class ID
router.get(
  "/class/:classId",
  asyncHandler(prepaymentController.getAllPrepaymentsByClass)
);

// Get prepayment by ID
router.get("/:id", asyncHandler(prepaymentController.getPrepaymentById));

// Create new prepayment (Admin only)
router.post(
  "/",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(createPrepaymentSchema),
  asyncHandler(prepaymentController.createPrepayment)
);

// Update prepayment (Admin only)
router.put(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(updatePrepaymentSchema),
  asyncHandler(prepaymentController.updatePrepayment)
);

// Delete prepayment (Admin only)
router.delete(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(prepaymentController.deletePrepayment)
);

// Get prepayments by student
router.get(
  "/student/:studentId",
  asyncHandler(prepaymentController.getPrepaymentsByStudent)
);

// Get active prepayments
router.get("/active", asyncHandler(prepaymentController.getActivePrepayments));

// Process prepayment usage (when student eats)
router.post("/:id/use", asyncHandler(prepaymentController.usePrepayment));

// Get prepayment usage history
router.get(
  "/:id/usage-history",
  asyncHandler(prepaymentController.getPrepaymentUsageHistory)
);

export default router;
