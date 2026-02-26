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

const sendInvalidId = (res, resourceName) => {
  return res.status(400).json(
    buildErrorPayload({
      message: `Invalid ${resourceName} id`,
      code: "INVALID_ID",
    })
  );
};

const sendNotFound = (res, resourceName) => {
  return res.status(404).json(
    buildErrorPayload({
      message: `${resourceName} not found`,
      code: "NOT_FOUND",
    })
  );
};

const sendConflict = (res, message) => {
  return res.status(409).json(
    buildErrorPayload({
      message,
      code: "CONFLICT",
    })
  );
};

module.exports = {
  AppError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  buildErrorPayload,
  sendInvalidId,
  sendNotFound,
  sendConflict,
};
