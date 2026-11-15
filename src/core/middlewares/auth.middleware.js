import { verifyToken } from "../utils/jwtHelper.js";
import ApiError from "../utils/ApiError.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return next(ApiError.unauthorized("Authentication required. Authorization header missing."));
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return next(ApiError.unauthorized("Invalid authorization format. Bearer token expected."));
  }

  try {
    const decoded = verifyToken(parts[1]);
    req.user = decoded;
    next();
  } catch (error) {
    return next(ApiError.unauthorized("Invalid or expired token."));
  }
};

export default authenticate;
