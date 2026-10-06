import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { User, IUser, UserRole } from "../models/User";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(401, "Authentication required. Please log in.")
      );
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(
        new ApiError(401, "User belonging to this token no longer exists.")
      );
    }

    if (!user.isActive) {
      return next(
        new ApiError(403, "Your account has been deactivated. Contact support.")
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
