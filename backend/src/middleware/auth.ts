import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Access token is required", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.TOKEN_SECRET as string
    ) as any;

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        gender: true,
      },
    });

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid token", 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    status: string;
  };
}

export const authenticateToken = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Access token is required", 401);
    }

    try {
      // Define the expected JWT payload type
      interface JwtPayload {
        id: number;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
      }
      const decoded = jwt.verify(
        token,
        process.env.TOKEN_SECRET as string
      ) as JwtPayload;

      // Fetch user from database to ensure they still exist and are active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 401);
      }

      req.user = {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
        status: "ACTIVE", // Default to ACTIVE, or add logic if you want to restrict
      };
      next();
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Token expired", 403);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid token", 403);
      }
      throw error;
    }
  }
);

export const requireRole = (roles: string | string[]) => {
  return asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
          403
        );
      }

      next();
    }
  );
};

// Middleware to check if user is admin or super admin
export const requireAdmin = requireRole(["ADMIN", "SUPER_ADMIN"]);

// Middleware to check if user is super admin only
export const requireSuperAdmin = requireRole("SUPER_ADMIN");

// Middleware to check if user is teacher
export const requireTeacher = requireRole("TEACHER");

// Middleware to check if user is admin, super admin, or teacher
export const requireStaff = requireRole(["ADMIN", "SUPER_ADMIN", "TEACHER"]);

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (userIdField = "userId") => {
  return asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);
      const resourceUserId = req.params[userIdField] || req.body[userIdField];
      const isOwner = req.user.id === resourceUserId;

      if (!isAdmin && !isOwner) {
        throw new AppError("Access denied. Insufficient permissions", 403);
      }

      next();
    }
  );
};

// Middleware to check if teacher can access class resources
export const requireClassAccess = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    // Admins can access all classes
    if (["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return next();
    }

    // Teachers can only access their assigned classes
    if (req.user.role === "TEACHER") {
      const classId = req.params.classId || req.body.classId;

      if (!classId) {
        throw new AppError("Class ID is required", 400);
      }

      const classExists = await prisma.class.findFirst({
        where: {
          id: parseInt(classId),
          supervisorId: parseInt(req.user.id),
        },
      });

      if (!classExists) {
        throw new AppError(
          "Access denied. You are not assigned to this class",
          403
        );
      }
    }

    next();
  }
);
