import type { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { AppError } from "../utils/AppError"

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))
        next(new AppError("Validation failed", 400, errorMessages))
      } else {
        next(error)
      }
    }
  }
}
