import * as authService from "./auth.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  return res.status(HttpStatus.OK).json(result);
});

export default {
  login,
  signup,
};
