const { ZodError } = require("zod");
const { logger } = require("../logger");
const {
  sendInternalServerError,
  sendValidationError,
} = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return sendValidationError(res, "Validation failed", err.flatten());
  }

  logger.error({ err }, "Unhandled error");
  return sendInternalServerError(res);
};

module.exports = { errorHandler };
