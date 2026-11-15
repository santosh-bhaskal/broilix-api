import * as dashboardService from "./dashboard.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";
import { getUserIdFromReq } from "../../core/utils/jwtHelper.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await dashboardService.getDashboardData(userId);
  return res.status(HttpStatus.OK).json(result);
});

export default {
  getDashboard,
};
