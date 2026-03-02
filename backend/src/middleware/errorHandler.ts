import { ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";
import { AppError, buildErrorPayload } from "../utils/errors";

const errorHandler = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    res.status(400).json(buildErrorPayload({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    }));
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(buildErrorPayload({
      message: err.message,
      code: err.code,
    }));
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json(buildErrorPayload({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  }));
};

export { errorHandler };
