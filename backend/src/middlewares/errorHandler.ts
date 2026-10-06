import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { config } from "../config/env";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Mongoose Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Database Validation Failed";
    errors = Object.values(err.errors).map((el: any) => el.message);
  }

  // Mongoose CastError (Invalid MongoDB ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.value}`;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired. Please log in again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(config.nodeEnv === "development" ? { stack: err.stack } : {}),
  });
};
