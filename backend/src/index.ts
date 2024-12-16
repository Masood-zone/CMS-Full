import express from "express";
// import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";

import { recordController } from "./controllers/records.controller";
import { prepaymentController } from "./controllers/prepayment.controller";
import { classController } from "./controllers/class.controller";
import { userController } from "./controllers/users.controller";
import { studentController } from "./controllers/student.controller";
import { settingsController } from "./controllers/settings.controller";
// import teacherController from "./controllers/teahers.controller";
import { setupDailyRecordCreation } from "../services/daily-records.cron";
import { analyticsController } from "./controllers/analytics.controller";
import { expensesController } from "./controllers/expenses.controller";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "https://canteen-management-frontend.vercel.app",
    "http://localhost:3000",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Authentication middleware
function authenticateToken(req: any, res: any, next: Function) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
}

// User routes
app.post("/signup", (req, res, next) => {
  userController.signup(req, res).catch(next); //Works
});
app.post("/login", (req, res, next) => {
  userController.login(req, res).catch(next); //Works
});
app.get("/users", authenticateToken, userController.getAll); //works
app.get("/users/:id", authenticateToken, userController.getById); //works
app.put("/users/:id", authenticateToken, userController.update); //works
app.delete("/users/:id", authenticateToken, userController.delete); //works

// Class routes
app.get("/classes", authenticateToken, classController.getAll); //works
app.get("/classes/:id", authenticateToken, classController.getById); //works
app.post("/classes", authenticateToken, classController.create); //works
app.put("/classes/:id", authenticateToken, classController.update); //works
app.delete("/classes/:id", authenticateToken, classController.delete); //works
app.get(
  "/classes/:id/supervisor",
  authenticateToken,
  classController.getClassBySupervisorId
); //works

// Student routes
app.get("/students", authenticateToken, studentController.getAll);
app.get("/students/:id", authenticateToken, studentController.getById);
app.get(
  "/students/class/:classId",
  authenticateToken,
  studentController.getClassById
);
app.post("/students", authenticateToken, async (req, res, next) => {
  try {
    await studentController.create(req, res);
  } catch (error) {
    next(error);
  }
});
app.put("/students/:id", authenticateToken, studentController.update);
app.delete("/students/:id", authenticateToken, studentController.delete);

// Record routes
app.get("/records", authenticateToken, async (req, res, next) => {
  try {
    await recordController.getAllRecords(req, res);
  } catch (error) {
    next(error);
  }
});
app.get("/records/unpaid", authenticateToken, async (req, res, next) => {
  try {
    await recordController.getUnpaidStudents(req, res);
  } catch (error) {
    next(error);
  }
});
app.get("/records/submitted", authenticateToken, async (req, res, next) => {
  try {
    await recordController.getSubmittedRecordsByDate(req, res);
  } catch (error) {
    next(error);
  }
});

app.get("/records/details", authenticateToken, async (req, res, next) => {
  try {
    await recordController.getRecordDetails(req, res);
  } catch (error) {
    next(error);
  }
});
app.post(
  "/records/generate-daily",
  authenticateToken,
  async (req, res, next) => {
    try {
      await recordController.generateDailyRecords(req, res);
    } catch (error) {
      next(error);
    }
  }
);
app.get("/records/:classId", authenticateToken, async (req, res, next) => {
  try {
    await recordController.getStudentRecordsByClassAndDate(req, res);
  } catch (error) {
    next(error);
  }
});
app.put("/records/:id", authenticateToken, recordController.update);
app.delete("/records/:id", authenticateToken, recordController.delete);
app.post("/records/submit", authenticateToken, async (req, res, next) => {
  try {
    await recordController.submitAdminRecord(req, res);
  } catch (error) {
    next(error);
  }
});

// Update student status
app.put("/records/:id/status", authenticateToken, async (req, res, next) => {
  try {
    await recordController.updateStudentStatus(req, res);
  } catch (error) {
    next(error);
  }
});

// Update student status
app.put("/records/:id/status", authenticateToken, async (req, res, next) => {
  try {
    await recordController.updateStudentStatus(req, res);
  } catch (error) {
    next(error);
  }
});
// Settings routes
app.get("/settings/amount", authenticateToken, settingsController.getAmount);
app.post("/settings/amount", authenticateToken, (req, res, next) => {
  settingsController.createAmount(req, res).catch(next);
});
app.put("/settings/amount", authenticateToken, (req, res, next) => {
  settingsController.updateAmount(req, res).catch(next);
});

// Expenses routes
// Get all expenses
app.get("/expenses", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.getAllExpenses(req, res);
  } catch (error) {
    next(error);
  }
});
// Get all references
app.get("/references", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.getAllReferences(req, res);
  } catch (error) {
    next(error);
  }
});
// Create an expense
app.post("/expenses", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.createExpense(req, res);
  } catch (error) {
    next(error);
  }
});
// Create a reference
app.post("/references", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.createReference(req, res);
  } catch (error) {
    next(error);
  }
});
// Get expense by id
app.get("/expenses/:id", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.getExpenseById(req, res);
  } catch (error) {
    next(error);
  }
});
// Get reference by id
app.get("/references/:id", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.getReferenceById(req, res);
  } catch (error) {
    next(error);
  }
});
// Update an expense
app.put("/expenses/:id", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.updateExpense(req, res);
  } catch (error) {
    next(error);
  }
});
// Update a reference
app.put("/references/:id", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.updateReference(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete an expense
app.delete("/expenses/:id", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.deleteExpense(req, res);
  } catch (error) {
    next(error);
  }
});
// Delete a reference
app.delete("/references/:id", authenticateToken, async (req, res, next) => {
  try {
    await expensesController.deleteReference(req, res);
  } catch (error) {
    next(error);
  }
});

// Analytics routes
app.get(
  "/analytics/admin-dashboard",
  authenticateToken,
  async (req, res, next) => {
    try {
      await analyticsController.getAdminAnalytics(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Prepayment routes
app.post(
  "/prepayments",
  authenticateToken,
  prepaymentController.createPrepayment
);
app.get("/prepayments/:id", authenticateToken, async (req, res, next) => {
  try {
    await prepaymentController.getAllPrepaymentsByClass(req, res);
  } catch (error) {
    next(error);
  }
});
app.get(
  "/prepayments",
  authenticateToken,
  prepaymentController.getAllPrepayments
);
app.get(
  "/prepayments/date-range",
  authenticateToken,
  async (req, res, next) => {
    try {
      await prepaymentController.getAllPrepaymentsWithinADate(req, res);
    } catch (error) {
      next(error);
    }
  }
);
app.put(
  "/prepayments/:id",
  authenticateToken,
  prepaymentController.updatePrepayment
);
app.delete(
  "/prepayments/:id",
  authenticateToken,
  prepaymentController.deletePrepayment
);

const PORT = process.env.PORT || 3400;
// Setup daily cron job
setupDailyRecordCreation();
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
