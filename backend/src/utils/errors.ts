import type { Response } from "express";
import type { ErrorPayload } from "../types";

class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") { super(message, 404, "NOT_FOUND"); }
}
class ConflictError extends AppError {
  constructor(message = "Conflict") { super(message, 409, "CONFLICT"); }
}
class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") { super(message, 401, "UNAUTHORIZED"); }
}
class ForbiddenError extends AppError {
  constructor(message = "Forbidden") { super(message, 403, "FORBIDDEN"); }
}
class BadRequestError extends AppError {
  constructor(message = "Bad request") { super(message, 400, "BAD_REQUEST"); }
}

interface BuildErrorPayloadArgs {
  message: string;
  code?: string;
  details?: unknown;
}

const buildErrorPayload = ({ message, code, details }: BuildErrorPayloadArgs): ErrorPayload => {
  const payload: ErrorPayload = { error: message };
  if (code) payload.code = code;
  if (details !== undefined) payload.details = details;
  return payload;
};

const sendInvalidId = (res: Response, resourceName: string): Response => {
  return res.status(400).json(buildErrorPayload({ message: `Invalid ${resourceName} id`, code: "INVALID_ID" }));
};

const sendNotFound = (res: Response, resourceName: string): Response => {
  return res.status(404).json(buildErrorPayload({ message: `${resourceName} not found`, code: "NOT_FOUND" }));
};

const sendConflict = (res: Response, message: string): Response => {
  return res.status(409).json(buildErrorPayload({ message, code: "CONFLICT" }));
};

export {
  AppError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  buildErrorPayload,
  sendInvalidId,
  sendNotFound,
  sendConflict,
};
