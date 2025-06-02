import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import classRoutes from "./class.routes";
import studentRoutes from "./student.routes";
import prepaymentRoutes from "./prepayment.routes";
import owingRoutes from "./owing.routes";
import settingsRoutes from "./settings.routes";
import analyticsRoutes from "./analytics.routes";
import expenseRoutes from "./expense.routes";
import recordRoutes from "./record.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/classes", classRoutes);
router.use("/students", studentRoutes);
router.use("/records", recordRoutes);
router.use("/prepayments", prepaymentRoutes);
router.use("/owings", owingRoutes);
router.use("/settings", settingsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/expenses", expenseRoutes);

export default router;
