import { errorResponse } from "../utils/response.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const logPayload = {
    level: statusCode >= 500 ? "error" : "warn",
    statusCode,
    message,
    method: req.method,
    path: req.originalUrl,
    requestId: res.locals?.requestId,
  };

  if (statusCode >= 500) {
    logger.error({ ...logPayload, stack: err.stack });
  } else {
    logger.warn(logPayload);
  }

  const error = process.env.NODE_ENV === "development" ? err.message : {};
  return errorResponse(res, message, error, statusCode);
};

export default errorHandler;
