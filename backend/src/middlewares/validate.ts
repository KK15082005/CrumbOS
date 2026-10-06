import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

type RequestPart = "body" | "query" | "params";

export const validate = (
  schema: ZodSchema,
  source: RequestPart = "body"
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        );
        return next(
          new ApiError(400, "Invalid input data provided", errorMessages)
        );
      }
      next(error);
    }
  };
};
