import * as feedService from "./feed-inventory.service.js";
import asyncHandler from "../../core/utils/asyncHandler.js";
import { HttpStatus } from "../../core/constants/httpStatus.js";
import { getUserIdFromReq } from "../../core/utils/jwtHelper.js";

export const getAll = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await feedService.getAllFeedInventories(userId);
  return res.status(HttpStatus.OK).json(result);
});

export const create = asyncHandler(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await feedService.createFeedInventory(req.body, userId);
  return res.status(HttpStatus.OK).json(result);
});

export const update = asyncHandler(async (req, res) => {
  const result = await feedService.updateFeedInventory(req.params.id, req.body);
  return res.status(HttpStatus.OK).json(result);
});

export const softDelete = asyncHandler(async (req, res) => {
  const result = await feedService.softDeleteFeedInventory(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await feedService.deleteFeedInventory(req.params.id);
  return res.status(HttpStatus.OK).json(result);
});

export default {
  getAll,
  create,
  update,
  softDelete,
  remove,
};
