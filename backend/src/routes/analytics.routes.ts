import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { analyticsController } from "../controllers/analytics.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard analytics
router.get(
  "/dashboard",
  asyncHandler(analyticsController.getDashboardAnalytics)
);

// Revenue analytics
router.get("/revenue", asyncHandler(analyticsController.getRevenueAnalytics));

// Student analytics
router.get("/students", asyncHandler(analyticsController.getStudentAnalytics));

// Class analytics
router.get("/classes", asyncHandler(analyticsController.getClassAnalytics));

// Teacher analytics
router.get("/teachers", asyncHandler(analyticsController.getTeacherAnalytics));

// Owing analytics
router.get("/owings", asyncHandler(analyticsController.getOwingAnalytics));

// Prepayment analytics
router.get(
  "/prepayments",
  asyncHandler(analyticsController.getPrepaymentAnalytics)
);

// Expense analytics
router.get("/expenses", asyncHandler(analyticsController.getExpenseAnalytics));

// Daily collection report
router.get(
  "/daily-collection",
  asyncHandler(analyticsController.getDailyCollectionReport)
);

// Monthly report
router.get(
  "/monthly-report",
  asyncHandler(analyticsController.getMonthlyReport)
);

// Yearly report
router.get("/yearly-report", asyncHandler(analyticsController.getYearlyReport));

// Custom date range report
router.get(
  "/custom-report",
  asyncHandler(analyticsController.getCustomDateRangeReport)
);

// Export data (Admin only)
router.get(
  "/export/:type",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(analyticsController.exportData)
);

export default router;
