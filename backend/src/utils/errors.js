const buildErrorPayload = ({ message, code, details }) => {
  const payload = { error: message };
  if (code) {
    payload.code = code;
  }
  if (details !== undefined) {
    payload.details = details;
  }
  return payload;
};

const sendError = (res, status, message, code, details) =>
  res.status(status).json(buildErrorPayload({ message, code, details }));

const sendValidationError = (res, message, details) =>
  sendError(res, 400, message, "VALIDATION_ERROR", details);

const sendInvalidId = (res, resource) =>
  sendError(res, 400, `Invalid ${resource} id`, "INVALID_ID");

const sendNotFound = (res, resource) =>
  sendError(res, 404, `${resource} not found`, "NOT_FOUND");

const sendConflict = (res, message) =>
  sendError(res, 409, message, "CONFLICT");

const sendInternalServerError = (res) =>
  sendError(res, 500, "Internal server error", "INTERNAL_SERVER_ERROR");

module.exports = {
  buildErrorPayload,
  sendError,
  sendValidationError,
  sendInvalidId,
  sendNotFound,
  sendConflict,
  sendInternalServerError,
};
