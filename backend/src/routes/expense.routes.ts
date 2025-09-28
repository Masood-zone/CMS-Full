import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createExpenseSchema,
  updateExpenseSchema,
  createExpenseReferenceSchema,
} from "../validations/expense.validation";
import { asyncHandler } from "../utils/asyncHandler";
import { expensesController } from "../controllers/expenses.controller";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all expenses
router.get("/", asyncHandler(expensesController.getAllExpenses));
// Expense References
router.get("/references", asyncHandler(expensesController.getAllReferences));
// Get expense by ID
router.get("/:id", asyncHandler(expensesController.getExpenseById));

// Create new expense (Admin only)
router.post(
  "/",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(createExpenseSchema),
  asyncHandler(expensesController.createExpense)
);

// Update expense (Admin only)
router.put(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(updateExpenseSchema),
  asyncHandler(expensesController.updateExpense)
);

// Delete expense (Admin only)
router.delete(
  "/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(expensesController.deleteExpense)
);

router.post(
  "/references",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  validate(createExpenseReferenceSchema),
  asyncHandler(expensesController.createReference)
);

router.put(
  "/references/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(expensesController.updateReference)
);

router.delete(
  "/references/:id",
  requireRole(["SUPER_ADMIN", "ADMIN"]),
  asyncHandler(expensesController.deleteReference)
);

// Get expenses by reference
router.get(
  "/by-reference/:referenceId",
  asyncHandler(expensesController.getExpensesByReference)
);

// Get expense statistics
router.get(
  "/stats/overview",
  asyncHandler(expensesController.getExpenseStatistics)
);

// Get monthly expense summary
router.get(
  "/stats/monthly",
  asyncHandler(expensesController.getMonthlyExpenseSummary)
);

export default router;
