const { ZodError } = require("zod");
const { logger } = require("../logger");
const { AppError, buildErrorPayload } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json(buildErrorPayload({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    }));
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(buildErrorPayload({
      message: err.message,
      code: err.code,
    }));
  }

  logger.error({ err }, "Unhandled error");
  return res.status(500).json(buildErrorPayload({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  }));
};

module.exports = { errorHandler };
