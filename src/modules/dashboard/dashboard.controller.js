import * as dashboardService from "./dashboard.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getDashboardData();
  return res.status(HttpStatus.OK).json(result);
});

export default {
  getDashboard,
};
