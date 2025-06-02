import dotenv from "dotenv";
import app from "./app";
import { setupCronJobs } from "./services/cronService";
import { logger } from "./utils/logger";
import { connectDatabase } from "./config/database";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3400;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info("✅ Database connected successfully");

    // Setup cron jobs
    setupCronJobs();
    logger.info("✅ Cron jobs initialized");

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
