import config from "../config/env.config.js";

export const successResponse = (
  res,
  message,
  data = undefined,
  statusCode = 200,
  extra = {}
) => {
  const response = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...extra,
  };

  if (res.locals?.requestId) {
    response.requestId = res.locals.requestId;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res,
  message = "Internal Server Error",
  error = {},
  statusCode = 500
) => {
  const response = {
    success: false,
    message,
    error,
  };

  if (res.locals?.requestId) {
    response.requestId = res.locals.requestId;
  }

  if (config.nodeEnv === "development" && error instanceof Error) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

export const validationErrorResponse = (res, errors) => {
  let formattedErrors = [];

  if (Array.isArray(errors)) {
    formattedErrors = errors.map((e) => ({
      field: e.field,
      message: e.message,
    }));
  }

  const response = {
    success: false,
    message: `Validation failed - ${formattedErrors[0]?.message || 'Invalid input'}`,
    errors: formattedErrors,
  };

  if (res.locals?.requestId) {
    response.requestId = res.locals.requestId;
  }

  return res.status(400).json(response);
};
