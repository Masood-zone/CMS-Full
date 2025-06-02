import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { settingsController } from "../controllers/settings.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get canteen daily amount
router.get(
  "/canteen/amount",
  asyncHandler(settingsController.getCanteenAmount)
);

// Update canteen daily amount (Admin only)
router.put(
  "/canteen/amount",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(settingsController.updateCanteenAmount)
);

// Delete canteen daily amount (Super Admin only)
router.delete(
  "/canteen/amount",
  requireRole(["SUPER_ADMIN"]),
  asyncHandler(settingsController.deleteSetting) // This will use key="canteen_daily_amount"
);

export default router;
