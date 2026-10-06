import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User";
import { ApiError } from "../utils/ApiError";

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Requires one of [${allowedRoles.join(
            ", "
          )}]. Your role is ${req.user.role}.`
        )
      );
    }

    next();
  };
};
