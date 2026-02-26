class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

const buildErrorPayload = ({ message, code, details }) => {
  const payload = { error: message };
  if (code) payload.code = code;
  if (details !== undefined) payload.details = details;
  return payload;
};

module.exports = {
  AppError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  buildErrorPayload,
};
