import { HttpStatus } from "../constants/httpStatus.js";

class ApiError extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message, stack = "") {
    return new ApiError(HttpStatus.BAD_REQUEST, message, stack);
  }

  static unauthorized(message, stack = "") {
    return new ApiError(HttpStatus.UNAUTHORIZED, message, stack);
  }

  static forbidden(message, stack = "") {
    return new ApiError(HttpStatus.FORBIDDEN, message, stack);
  }

  static notFound(message, stack = "") {
    return new ApiError(HttpStatus.NOT_FOUND, message, stack);
  }

  static conflict(message, stack = "") {
    return new ApiError(HttpStatus.CONFLICT, message, stack);
  }

  static internal(message, stack = "") {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, stack);
  }
}

export default ApiError;
