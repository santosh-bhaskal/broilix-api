import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";
import { getUserIdFromReq } from "../../core/utils/jwtHelper.js";
import ApiError from "../../core/utils/ApiError.js";
import * as notificationService from "./notification.service.js";

const currentUserId = (req) => {
  const userId = getUserIdFromReq(req);
  if (!userId) throw ApiError.unauthorized("Authentication required.");
  return userId;
};

export const registerPushToken = asyncHandler(async (req, res) =>
  res.status(HttpStatus.CREATED).json(await notificationService.registerPushToken(currentUserId(req), req.body))
);

export const unregisterPushToken = asyncHandler(async (req, res) =>
  res.status(HttpStatus.OK).json(await notificationService.unregisterPushToken(currentUserId(req), req.body.token))
);

export const sendTestNotification = asyncHandler(async (req, res) =>
  res.status(HttpStatus.OK).json(await notificationService.sendToUser(currentUserId(req), req.body))
);
