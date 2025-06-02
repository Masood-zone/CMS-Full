import type { Response } from "express"

interface ApiResponse {
  success: boolean
  message?: string
  data?: any
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const sendResponse = (res: Response, statusCode: number, message: string, data?: any, pagination?: any) => {
  const response: ApiResponse = {
    success: statusCode < 400,
    message,
    ...(data && { data }),
    ...(pagination && { pagination }),
  }

  res.status(statusCode).json(response)
}

export const sendSuccess = (res: Response, message: string, data?: any, pagination?: any) => {
  sendResponse(res, 200, message, data, pagination)
}

export const sendCreated = (res: Response, message: string, data?: any) => {
  sendResponse(res, 201, message, data)
}

export const sendNoContent = (res: Response) => {
  res.status(204).send()
}
