import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../config/database"
import { AppError } from "../utils/AppError"
import { sendSuccess, sendCreated } from "../utils/response"

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        classes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      throw new AppError("Invalid credentials", 401)
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password || "")
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401)
    }

    // Generate tokens
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.TOKEN_SECRET as string, {
      expiresIn: "24h",
    })

    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    sendSuccess(res, "Login successful", {
      user: userWithoutPassword,
      token,
      refreshToken,
    })
  }

  async signup(req: Request, res: Response) {
    const { email, password, name, phone, role, gender } = req.body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new AppError("User already exists", 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        gender,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        gender: true,
        createdAt: true,
      },
    })

    sendCreated(res, "User created successfully", user)
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 401)
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as any

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
        },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      const newToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.TOKEN_SECRET as string,
        { expiresIn: "24h" },
      )

      sendSuccess(res, "Token refreshed successfully", { token: newToken })
    } catch (error) {
      throw new AppError("Invalid refresh token", 401)
    }
  }

  async logout(req: Request, res: Response) {
    // In a real application, you might want to blacklist the token
    sendSuccess(res, "Logout successful")
  }
}
