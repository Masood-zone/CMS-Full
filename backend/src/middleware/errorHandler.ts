import type { Request, Response, NextFunction } from "express"
import { Prisma } from "@prisma/client"
import { AppError } from "../utils/AppError"

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let message = "Internal Server Error"
  let details: any = undefined

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    details = error.details
  }
  // Handle Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        statusCode = 409
        message = "Resource already exists"
        break
      case "P2025":
        statusCode = 404
        message = "Resource not found"
        break
      case "P2003":
        statusCode = 400
        message = "Foreign key constraint failed"
        break
      default:
        statusCode = 400
        message = "Database operation failed"
    }
  }
  // Handle validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400
    message = "Validation failed"
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error)
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
  })
}
