import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

// Attach event listeners to Prisma for logging
prisma.$on("query", (e) => {
  logger.debug(
    `Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`
  );
});

prisma.$on("info", (e) => {
  logger.info(e.message);
});

prisma.$on("warn", (e) => {
  logger.warn(e.message);
});

prisma.$on("error", (e) => {
  logger.error(e.message);
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

export default prisma;
